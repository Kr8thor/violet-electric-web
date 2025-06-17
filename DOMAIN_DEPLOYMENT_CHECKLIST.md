# 🌐 Domain Deployment Checklist for violetrainwater.com

## ✅ Pre-Deployment Status
- [x] React app ready at lustrous-dolphin-447351.netlify.app
- [x] WordPress backend configured at wp.violetrainwater.com  
- [x] Universal editing system fully functional
- [x] Cross-origin communication working
- [x] Content persistence system operational

## 🚀 Deployment Steps

### **Step 1: Add Domain to Netlify**
1. Go to: https://app.netlify.com/sites/lustrous-dolphin-447351/settings/domain
2. Click "Add custom domain"
3. Enter: `violetrainwater.com`
4. Click "Verify" and confirm ownership
5. Also add: `www.violetrainwater.com`

### **Step 2: Configure DNS Records**
**Where:** Your domain registrar (where violetrainwater.com is managed)

**Add these records:**
```
Type: A
Name: @ (or blank for root domain)
Value: 75.2.60.5
TTL: 300

Type: CNAME  
Name: www
Value: lustrous-dolphin-447351.netlify.app
TTL: 300

Type: CNAME
Name: *
Value: lustrous-dolphin-447351.netlify.app
TTL: 300
```

### **Step 3: Update WordPress Settings**
1. **WordPress Admin URLs:**
   - Go to: https://wp.violetrainwater.com/wp-admin/
   - Settings → General
   - Update "Site Address (URL)" to: `https://violetrainwater.com`
   - Keep "WordPress Address (URL)" as: `https://wp.violetrainwater.com`

2. **Update Universal Editor Settings:**
   - Go to: WordPress Admin → Universal Editor → Settings
   - Update "Netlify Site URL" to: `https://violetrainwater.com`
   - Keep build hook as: `https://api.netlify.com/build_hooks/684054a7aed5fdf9f3793a0f`

### **Step 4: Test the Domain Setup**
**After DNS propagation (24-48 hours):**

1. **Test Frontend Access:**
   ```bash
   curl -I https://violetrainwater.com
   # Should return: HTTP/2 200
   ```

2. **Test WordPress Proxy:**
   ```bash
   curl -I https://violetrainwater.com/wp-admin/
   # Should redirect to WordPress login
   ```

3. **Test API Endpoints:**
   ```bash
   curl https://violetrainwater.com/wp-json/violet/v1/content
   # Should return content data
   ```

4. **Test Universal Editor:**
   - Go to: https://wp.violetrainwater.com/wp-admin/
   - Navigate to Universal Editor
   - Verify iframe loads: https://violetrainwater.com
   - Test editing functionality

### **Step 5: SSL Certificate**
**Automatic via Netlify:**
- SSL certificate will be provisioned automatically
- Usually takes 1-24 hours after domain is added
- Status visible in Netlify dashboard

### **Step 6: Force HTTPS Redirects**
**In Netlify Dashboard:**
1. Go to: https://app.netlify.com/sites/lustrous-dolphin-447351/settings/domain
2. Enable "Force HTTPS"
3. This redirects all HTTP to HTTPS automatically

## 🔍 Verification Commands

### **DNS Propagation Check:**
```bash
# Check if DNS has propagated
nslookup violetrainwater.com
dig violetrainwater.com

# Online tools:
# https://dnschecker.org
# https://whatsmydns.net
```

### **SSL Certificate Check:**
```bash
# Check SSL certificate
openssl s_client -connect violetrainwater.com:443 -servername violetrainwater.com

# Online tool:
# https://www.ssllabs.com/ssltest/
```

### **Full System Test:**
```bash
# Test main site
curl -L https://violetrainwater.com

# Test WordPress admin (should redirect)
curl -L https://violetrainwater.com/wp-admin/

# Test API (should return JSON)
curl https://violetrainwater.com/wp-json/violet/v1/content

# Test GraphQL
curl -X POST https://violetrainwater.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title } }"}'
```

## ⚠️ Potential Issues & Solutions

### **Issue 1: DNS Not Propagating**
**Symptoms:** Domain doesn't resolve or shows old content
**Solution:** 
- Wait 24-48 hours for full global propagation
- Clear local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Try different DNS servers (8.8.8.8, 1.1.1.1)

### **Issue 2: SSL Certificate Pending**
**Symptoms:** "Not secure" warning in browser
**Solution:**
- Wait for Netlify to provision certificate (usually < 24 hours)
- Check certificate status in Netlify dashboard
- Verify domain ownership if prompted

### **Issue 3: WordPress Admin Access Issues**
**Symptoms:** Can't access wp-admin through new domain
**Solution:**
- Ensure WordPress Site Address is set to violetrainwater.com
- Clear WordPress cache if using caching plugins
- Update .htaccess rules if needed

### **Issue 4: Universal Editor Not Loading**
**Symptoms:** Iframe shows error or blank page
**Solution:**
- Update Universal Editor settings with new domain
- Check CORS configuration in functions.php
- Verify allowed origins include violetrainwater.com

### **Issue 5: API Endpoints Not Working**
**Symptoms:** 404 errors on /wp-json/ or /graphql endpoints
**Solution:**
- Check netlify.toml proxy rules are correctly configured
- Verify WordPress REST API is enabled
- Test direct access: wp.violetrainwater.com/wp-json/

## 📋 Post-Deployment Tasks

### **Immediate (Day 1):**
- [ ] Verify domain resolves correctly
- [ ] Test SSL certificate installation
- [ ] Check all site functionality
- [ ] Test Universal Editor with new domain
- [ ] Update any hardcoded URLs in content
- [ ] Test mobile responsiveness

### **Short-term (Week 1):**
- [ ] Monitor site performance and uptime
- [ ] Check search engine indexing
- [ ] Update Google Analytics/Search Console
- [ ] Test all forms and contact methods
- [ ] Verify email deliverability

### **Long-term (Month 1):**
- [ ] Monitor SEO rankings for domain change
- [ ] Update marketing materials with new domain
- [ ] Set up 301 redirects from old domain if applicable
- [ ] Review and optimize site performance
- [ ] Plan any additional features or improvements

## 🎯 Success Criteria

**Domain deployment is successful when:**
- [ ] violetrainwater.com loads the React frontend
- [ ] SSL certificate is active (green lock icon)
- [ ] WordPress admin accessible via domain proxy
- [ ] Universal Editor works with new domain
- [ ] All API endpoints responding correctly
- [ ] No console errors in browser
- [ ] Site performance maintained or improved
- [ ] All editing functionality preserved

## 📞 Emergency Contacts

**If issues arise:**
- **Netlify Support:** https://app.netlify.com/support
- **Domain Registrar:** Check your domain provider's support
- **WP Engine Support:** https://my.wpengine.com/support
- **DNS Troubleshooting:** Use online DNS checker tools

## 🚀 Final Notes

This deployment moves your site to the production domain while maintaining all existing functionality. The universal editing system will continue to work seamlessly with the new domain.

**Expected Timeline:**
- Domain addition: Immediate
- DNS propagation: 2-48 hours  
- SSL certificate: 1-24 hours
- Full functionality: Within 48 hours

**Post-deployment, your architecture will be:**
```
violetrainwater.com (Production Domain)
         ↓
   Netlify CDN (Global Distribution)
         ↓
   React Frontend (Static Files)
         ↓
   API Proxy Rules (Seamless)
         ↓
   wp.violetrainwater.com (WordPress Backend)
```

The system is production-ready and this domain deployment completes the final production setup phase.
