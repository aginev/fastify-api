# Password Security Best Practices

This document outlines the best practices for implementing secure password handling in the Node.js application.

## 🔐 **Password Hashing Algorithms**

### **1. bcrypt (Recommended)**
- **Security Level**: High
- **Industry Standard**: Battle-tested and widely adopted
- **Salt Generation**: Automatic, unique salt per password
- **Work Factor**: Configurable (12-14 recommended)
- **Performance**: Designed to be slow (good for security)

### **2. Argon2 (Most Secure)**
- **Security Level**: Highest
- **Status**: Winner of the Password Hashing Competition
- **Memory Hard**: Resistant to hardware attacks
- **Configurable**: Time, memory, and parallelism parameters
- **Complexity**: More complex to implement and configure

### **3. scrypt**
- **Security Level**: High
- **Memory Hard**: Resistant to hardware attacks
- **Configurable**: N, r, p parameters for memory and CPU cost
- **Performance**: Good balance of security and performance

## 🚀 **Implementation with bcrypt**

### **Installation**
```bash
pnpm add bcrypt @types/bcrypt
```

## 🔒 **Unique Constraints and Validation**

### **Database-Level Constraints**
```sql
-- Email and username must be unique across the entire system
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,      -- Unique constraint
    username VARCHAR(100) NOT NULL UNIQUE,   -- Unique constraint
    password_hash VARCHAR(255) NOT NULL,
    -- ... other fields
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (username)
);
```

### **Service-Level Validation**
```typescript
export const userService = {
    /**
     * Check if email is available (not used by any user)
     */
    async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId 
            ? and(eq(users.email, email), ne(users.id, excludeUserId))
            : eq(users.email, email);
        
        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },

    /**
     * Check if username is available (not used by any user)
     */
    async isUsernameAvailable(username: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId 
            ? and(eq(users.username, username), ne(users.id, excludeUserId))
            : eq(users.username, username);
        
        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },
};
```

### **Unique Constraint Benefits**
- **Data Integrity**: Prevents duplicate emails/usernames
- **User Experience**: Clear error messages for conflicts
- **Security**: Prevents account confusion and impersonation
- **Performance**: Database indexes on unique fields
- **Validation**: Service-level checks before database operations

### **Single Query Optimization**
- **Eliminates Multiple Database Calls**: Single query instead of two separate ones
- **Better Performance**: Reduced network round trips and database load
- **Atomic Validation**: Both email and username checked in one operation
- **Comprehensive Error Handling**: Clear feedback for all types of conflicts
- **Reusable Helper Methods**: `areEmailAndUsernameAvailable()` for consistent validation

### **Race Condition Protection**
- **Service-Level Validation**: Primary uniqueness checks before database operations
- **Database-Level Fallback**: Handles concurrent requests and race conditions
- **Optimized Error Messages**: Generic but helpful messages for edge cases
- **Defensive Programming**: Multiple layers of protection for data integrity

### **MySQL $returningId() Optimization**
- **Direct ID Retrieval**: Uses Drizzle ORM's `$returningId()` for MySQL autoincrement
- **Eliminates Guesswork**: No need to fetch by email/username after insert
- **Better Performance**: Single insert operation with immediate ID return
- **Type Safety**: Returns properly typed `{ id: number }[]` array
- **MySQL Specific**: Designed specifically for MySQL's autoincrement behavior

### **Password Hashing Service**
```typescript
import bcrypt from 'bcrypt';

export const passwordService = {
    /**
     * Hash a password securely
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12; // Industry standard
        return bcrypt.hash(password, saltRounds);
    },

    /**
     * Verify a password against a hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },
};
```

### **User Service Integration**
```typescript
export const userService = {
    /**
     * Create a new user with hashed password
     */
    async create(userData: NewUser): Promise<User> {
        // Check if email or username already exists in a single query
        const existingUser = await db
            .select({ email: users.email, username: users.username })
            .from(users)
            .where(
                or(
                    eq(users.email, userData.email),
                    eq(users.username, userData.username)
                )
            );

        if (existingUser.length > 0) {
            const conflicts = existingUser.map(user => {
                if (user.email === userData.email) return 'email';
                if (user.username === userData.username) return 'username';
                return null;
            }).filter(Boolean);

            if (conflicts.includes('email') && conflicts.includes('username')) {
                throw new Error('Email and username already exist in the system');
            } else if (conflicts.includes('email')) {
                throw new Error('Email already exists in the system');
            } else if (conflicts.includes('username')) {
                throw new Error('Username already exists in the system');
            }
        }

        // Hash the password before storing
        const hashedPassword = await this.hashPassword(userData.passwordHash);
        
        const userToCreate = {
            ...userData,
            passwordHash: hashedPassword,
        };

        // Use $returningId() to get the inserted ID directly from MySQL
        const result = await db.insert(users).values(userToCreate).$returningId();
        
        // $returningId() returns an array of { id: number } objects
        if (!result || result.length === 0) {
            throw new Error('Failed to create user');
        }

        // Fetch the complete user data using the returned ID
        const [user] = await db.select().from(users).where(eq(users.id, result[0].id));
        // ... rest of creation logic
    },

    /**
     * Authenticate user with email/username and password
     */
    async authenticate(identifier: string, password: string): Promise<User | null> {
        // Single query to find user by email OR username
        const [user] = await db
            .select()
            .from(users)
            .where(
                or(
                    eq(users.email, identifier),
                    eq(users.username, identifier)
                )
            );

        if (!user) {
            return null;
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
            return null;
        }

        return user;
    },

    /**
     * Check if email is available
     */
    async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId 
            ? and(eq(users.email, email), ne(users.id, excludeUserId))
            : eq(users.email, email);
        
        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },

    /**
     * Check if username is available
     */
    async isUsernameAvailable(username: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId 
            ? and(eq(users.email, username), ne(users.id, excludeUserId))
            : eq(users.email, username);
        
        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },
};
```

## ⚙️ **Configuration Options**

### **bcrypt Salt Rounds**
```typescript
// Development (faster, less secure)
const saltRounds = 10;

// Production (slower, more secure)
const saltRounds = 12;

// High Security (slowest, most secure)
const saltRounds = 14;
```

### **Argon2 Configuration**
```typescript
import argon2 from 'argon2';

const hashOptions = {
    type: argon2.argon2id,        // Recommended variant
    memoryCost: 2 ** 16,          // 64 MB
    timeCost: 3,                   // 3 iterations
    parallelism: 1,                // Single thread
};
```

## 🛡️ **Security Best Practices**

### **Password Requirements**
- **Minimum Length**: 8 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, symbols
- **Common Passwords**: Block common weak passwords
- **User Education**: Provide password strength feedback

### **Implementation Security**
```typescript
// ✅ Good - Constant time comparison
const isValidPassword = await bcrypt.compare(password, hash);

// ❌ Bad - Timing attack vulnerable
const isValidPassword = password === storedPassword;

// ✅ Good - Rate limiting
const maxAttempts = 5;
const lockoutDuration = 15 * 60 * 1000; // 15 minutes
```

### **Password Update Security**
```typescript
export const userService = {
    /**
     * Update user password securely
     */
    async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<User | undefined> {
        // Verify current password first
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash and update new password
        const hashedPassword = await this.hashPassword(newPassword);
        
        await db
            .update(users)
            .set({ 
                passwordHash: hashedPassword, 
                updatedAt: new Date() 
            })
            .where(eq(users.id, userId));

        return this.findById(userId);
    },
};
```

## 🔒 **Additional Security Measures**

### **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
```

### **Account Lockout**
```typescript
export const userService = {
    /**
     * Track failed login attempts
     */
    async recordFailedLogin(userId: number): Promise<void> {
        const user = await this.findById(userId);
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        
        await db
            .update(users)
            .set({ 
                failedLoginAttempts: failedAttempts,
                lastFailedLogin: new Date(),
                lockedUntil: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
            })
            .where(eq(users.id, userId));
    },

    /**
     * Reset failed login attempts on successful login
     */
    async resetFailedLoginAttempts(userId: number): Promise<void> {
        await db
            .update(users)
            .set({ 
                failedLoginAttempts: 0,
                lastFailedLogin: null,
                lockedUntil: null
            })
            .where(eq(users.id, userId));
    },
};
```

### **Password History**
```typescript
// Prevent reuse of recent passwords
export const passwordService = {
    async isPasswordReused(userId: number, newPassword: string): Promise<boolean> {
        const passwordHistory = await db
            .select()
            .from(passwordHistory)
            .where(eq(passwordHistory.userId, userId))
            .orderBy(desc(passwordHistory.createdAt))
            .limit(5);

        for (const historyEntry of passwordHistory) {
            const isMatch = await bcrypt.compare(newPassword, historyEntry.passwordHash);
            if (isMatch) {
                return true;
            }
        }

        return false;
    },
};
```

## 📊 **Database Schema Updates**

### **User Table Enhancements**
```sql
ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN last_failed_login TIMESTAMP NULL,
ADD COLUMN locked_until TIMESTAMP NULL,
ADD COLUMN password_changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN password_expires_at TIMESTAMP NULL;

-- Index for security queries
CREATE INDEX idx_users_security ON users (failed_login_attempts, locked_until);
```

### **Password History Table**
```sql
CREATE TABLE password_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id_created_at (user_id, created_at),
    CONSTRAINT fk_password_history_user_id FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🧪 **Testing Password Security**

### **Unit Tests**
```typescript
describe('Password Security', () => {
    it('should hash passwords with different salts', async () => {
        const password = 'testPassword123';
        const hash1 = await passwordService.hashPassword(password);
        const hash2 = await passwordService.hashPassword(password);

        expect(hash1).not.toBe(hash2); // Different salts
        expect(await passwordService.verifyPassword(password, hash1)).toBe(true);
        expect(await passwordService.verifyPassword(password, hash2)).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
        const password = 'testPassword123';
        const hash = await passwordService.hashPassword(password);

        expect(await passwordService.verifyPassword('wrongPassword', hash)).toBe(false);
    });
});
```

### **Performance Testing**
```typescript
describe('Password Hashing Performance', () => {
    it('should complete hashing within reasonable time', async () => {
        const password = 'testPassword123';
        const startTime = Date.now();
        
        await passwordService.hashPassword(password);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should take between 100ms and 2000ms (adjust based on salt rounds)
        expect(duration).toBeGreaterThan(100);
        expect(duration).toBeLessThan(2000);
    });
});
```

## 🚨 **Security Considerations**

### **Timing Attacks**
- **Use constant-time comparison** (bcrypt.compare handles this)
- **Avoid string comparison** for password verification
- **Implement rate limiting** to prevent brute force attacks

### **Password Storage**
- **Never store plain text passwords**
- **Use strong hashing algorithms** (bcrypt, Argon2, scrypt)
- **Implement proper salt generation** (bcrypt handles this automatically)
- **Consider password history** to prevent reuse

### **Authentication Flow**
- **Implement account lockout** after failed attempts
- **Use secure session management**
- **Implement password expiration** for sensitive applications
- **Provide password strength feedback**

### **Compliance**
- **GDPR**: Secure handling of personal data
- **SOC 2**: Security controls for data protection
- **PCI DSS**: If handling payment information
- **Industry Standards**: Follow OWASP guidelines

## 📚 **Additional Resources**

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Remember:** Password security is critical for application security. Always use industry-standard hashing algorithms and implement proper security measures.
