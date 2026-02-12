# Add to Cart Debugging Guide

## Problem

Items show as "successfully added" but don't appear in the cart.

## Solution Steps

### 1. Check Server Console Logs

When you click "Add to Cart", look for these logs in your terminal where you ran `npm run dev`:

**Success Flow (should see these logs):**

```
🛒 addToCart called for product: [productId]
🔐 User authenticated: [email]
✅ Using user ID: [userId]
✅ Product found: { id, name, availableQty }
(either)
  📝 Item already in cart, updating quantity from X to Y
  OR
  🆕 Adding new item to cart: { cartId, productId, quantity }
✅ Item quantity updated successfully
(OR)
✅ New item added to cart successfully
🔍 Verification - Current cart items: { count, items }
✅ Added to cart successfully!
```

### 2. Check for Errors

Look for any of these error patterns:

**Authentication Error:**

```
❌ User not authenticated
OR
❌ No user email in session
```

**Fix:** Make sure you're logged in before adding to cart

**Product Error:**

```
❌ Product error: ...
Returns "Product not available"
```

**Fix:** Verify the product ID is correct and the product is published

**Cart Error:**

```
❌ Cart fetch error: ...
OR
❌ Cart creation error: ...
❌ Insert error: ...
❌ Update error: ...
```

**Fix:** Check your Supabase database connection and table schema

### 3. Key Things to Check

#### A. Database Schema Verification

Make sure your `cart_items` table has these columns:

- `id` (primary key)
- `cart_id` (foreign key to carts)
- `product_id` (foreign key to products)
- `quantity` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### B. Products Table

Verify the `products` table has:

- `id`
- `name`
- `price`
- `quantity` (stock)
- `is_published` (boolean)
- `image` (optional)

#### C. Carts Table

Verify the `carts` table has:

- `id` (primary key)
- `user_id` (foreign key to users)
- `session_id` (optional)
- `is_active` (boolean)
- `created_at`
- `updated_at`

### 4. Test Steps

1. **Open your terminal** where `npm run dev` is running
2. **Scroll to see all output** (might be mixed with other logs)
3. **Click "Add to Cart"** and watch the console
4. **Copy any error messages** and check against the error patterns above

### 5. Common Issues

| Issue                      | Cause                     | Solution                                               |
| -------------------------- | ------------------------- | ------------------------------------------------------ |
| Foreign key error (23503)  | User doesn't exist in DB  | Check /auth/signin, ensure user is created in database |
| "Product not available"    | Product ID mismatch       | Verify product exists and `is_published = true`        |
| No logs appear             | Server crashed            | Restart `npm run dev`                                  |
| Items added but cart empty | getCart not finding items | Check cart_items query in database                     |

### 6. Quick Database Check

Run this in Supabase SQL Editor:

```sql
-- Check if products exist
SELECT id, name, is_published FROM products LIMIT 5;

-- Check if your user exists
SELECT id, email FROM users WHERE email = 'your-email@example.com';

-- Check carts for your user
SELECT id, user_id, is_active FROM carts
WHERE user_id = 'your-user-id' LIMIT 5;

-- Check cart items
SELECT * FROM cart_items
WHERE cart_id IN (
  SELECT id FROM carts WHERE user_id = 'your-user-id'
);
```

## Still Having Issues?

1. Check the full server output - look for red error text
2. Check your `.env.local` file has correct Supabase credentials
3. Make sure you're using the service role key in cart-actions.js (it's a server action)
4. Check database permissions in Supabase RLS policies

## Files Modified

- `app/_lib/actions/cart-actions.js` - Added detailed logging
- Console logs now include verification steps
