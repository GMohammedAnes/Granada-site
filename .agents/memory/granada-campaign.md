---
name: Granada launch campaign
description: User-set first-batch reservation figures and countdown behavior.
---

The L'Essence d'Andalousie first batch starts with 86 of 100 units reserved (14 remaining). One shared 24-hour countdown begins at the first public campaign request, not separately for each visitor. Each bottle in an accepted order consumes one unit, and the first batch stops accepting pre-orders at 100.

**Why:** The user supplied the 86% and 14 remaining figures, then chose a first-public-launch countdown and a live meter capped at 100. Counting bottles rather than order records prevents multi-bottle bookings from exceeding the physical first-batch limit.

**How to apply:** Keep the baseline and cap aligned across the campaign API and storefront, counting every bottle quantity. Do not reset the timer per browser or change the batch size without confirming the new launch stock.
