# Security Guide - AI Speech App

This document outlines the security features and best practices implemented in the AI Speech App user management system.

## 🔐 Security Features

### Authentication & Authorization

- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Access Control (RBAC)**: Admin, moderator, and user roles
- **Password Security**: bcrypt hashing with 12 rounds
- **Session Management**: Token blacklisting and session invalidation
- **Account Lockout**: Temporary account lockout after failed login attempts

### Data Protection

- **File Encryption**: AES-256 encryption for uploaded audio files
- **Secure Key Management**: Environment-based key configuration
- **Database Security**: Parameterized queries to prevent SQL injection
- **Input Validation**: Comprehensive data validation and sanitization

### Security Middleware

- **Rate Limiting**: 100 requests per 5 minutes per IP
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Request Logging**: Comprehensive audit trail
- **Attack Detection**: Automatic IP blocking for suspicious activity

## 🚀 Deployment Security

### Environment Configuration

1. **Generate Secure Keys**:
```bash
# Generate secure random keys
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))"
```

2. **Update .env file**:
```env
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-generated-jwt-key
ENCRYPTION_KEY=your-generated-encryption-key
DEBUG=false
ENCRYPT_AUDIO_FILES=true
```

3. **File Permissions**:
```bash
# Set restrictive permissions
chmod 600 .env
chmod 600 encryption_salt.key
chmod 700 uploads/
chmod 700 audio_outputs/
```

### Database Security

1. **Use PostgreSQL in Production**:
```env
DATABASE_URL=postgresql://username:password@localhost/speechapp
```

2. **Database Permissions**:
- Create dedicated database user
- Grant minimal required permissions
- Use connection pooling

### Network Security

1. **HTTPS Only**:
```python
# Add to production settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

2. **CORS Configuration**:
```env
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
```

## 👤 User Management

### Default Admin Account

- Username: `admin`
- Password: Auto-generated (check server logs)
- **IMPORTANT**: Change password immediately after first login

### User Registration

- Strong password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
  - At least 1 special character

### Role Permissions

**Admin**:
- Full system access
- User management
- System configuration
- All voice cloning features

**Moderator**:
- User management (limited)
- Voice embedding analysis
- Content moderation

**User**:
- Own profile management
- Voice cloning (own voices only)
- Audio processing

## 🛡️ Security Best Practices

### For Developers

1. **Never commit secrets**: Use environment variables
2. **Input validation**: Validate all user inputs
3. **Audit logging**: Log security-relevant events
4. **Regular updates**: Keep dependencies updated
5. **Code review**: Security-focused code reviews

### For Administrators

1. **Monitor logs**: Regular log analysis
2. **Update regularly**: Apply security patches promptly
3. **Backup strategy**: Secure, encrypted backups
4. **Access control**: Principle of least privilege
5. **SSL certificates**: Keep certificates current

### For Users

1. **Strong passwords**: Use unique, complex passwords
2. **Regular logout**: Don't leave sessions open
3. **Secure networks**: Avoid public Wi-Fi for sensitive operations
4. **Report issues**: Report security concerns immediately

## 🚨 Incident Response

### Security Incident Checklist

1. **Immediate Response**:
   - Identify and contain the threat
   - Preserve evidence
   - Notify administrator

2. **Assessment**:
   - Determine scope of compromise
   - Identify affected systems/data
   - Document findings

3. **Recovery**:
   - Restore from clean backups
   - Apply security patches
   - Reset compromised credentials

4. **Post-Incident**:
   - Conduct lessons learned review
   - Update security procedures
   - Implement additional controls

### Contact Information

- **Security Issues**: security@yourdomain.com
- **Emergency Contact**: +1-xxx-xxx-xxxx
- **Admin Contact**: admin@yourdomain.com

## 📊 Security Monitoring

### Key Metrics

- Failed authentication attempts
- Rate limit violations  
- Unusual access patterns
- File upload anomalies
- Database connection errors

### Log Analysis

```bash
# Monitor authentication failures
grep "Authentication failed" logs/app.log

# Check rate limit violations
grep "Rate limit exceeded" logs/app.log

# Review security headers
curl -I https://yourdomain.com/api/v1/status
```

## 🔄 Regular Security Tasks

### Weekly

- [ ] Review authentication logs
- [ ] Check for failed login patterns
- [ ] Monitor rate limiting effectiveness

### Monthly

- [ ] Update dependencies
- [ ] Review user permissions
- [ ] Rotate JWT secrets (if required)
- [ ] Test backup restoration

### Quarterly

- [ ] Security audit
- [ ] Penetration testing
- [ ] Update incident response procedures
- [ ] Review and update access controls

## ⚠️ Known Limitations

1. **Session Persistence**: Sessions persist until token expiry
2. **File Retention**: Encrypted files stored indefinitely (implement cleanup)
3. **Audit Logging**: Limited to application-level events
4. **Password Reset**: No automated password reset (manual admin process)

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [Python Cryptography](https://cryptography.io/en/latest/)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Review Date**: April 2025