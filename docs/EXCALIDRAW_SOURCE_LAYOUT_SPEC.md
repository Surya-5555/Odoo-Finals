# Excalidraw Source Layout Spec

Generated from: docs/Subscription Management System 24 hours.excalidraw

This file is an **auto-extracted** screen + positioning reference (coordinates are Excalidraw canvas units).

## Screens detected (20)

- 1. **Login Page** (container: NqYqPEavhmQP28aCpTrO-) — x=-7727, y=-13328, w=529, h=591
- 2. **Signup Page** (container: YLsvLNlZLYYq-oWZsATmP) — x=-6969, y=-13324, w=534, h=581
- 3. **Reset Password Page** (container: ctFFPePpL_B1RxeOtcEHy) — x=-8488, y=-13186, w=575, h=451
- 4. **Product List Page** (container: KcOrTP6QJ-Squ7VKDGKi5) — x=-8960, y=-12357, w=837, h=1063
- 5. **Shop Page** (container: wRZVj3r3mv8f8ttJPKoZq) — x=-7595, y=-12351, w=880, h=750
- 6. **Products** (container: BzQLIwt66luT3mjTds2PM) — x=-7601, y=-11176, w=880, h=750
- 7. **On click of this it should take user page** (container: 5NVDc7kaWGnOst7BWPTCI) — x=-9877, y=-10318, w=467, h=490
- 8. **Product form view Page** (container: 7xErP2guS4DNUKian3047) — x=-7078, y=-8889, w=1050, h=470
- 9. **Invoice** (container: st5KQ50Au0JpGldbEcQar) — x=-1512, y=-7408, w=991, h=479
- 10. **Product List Page** (container: PK6Z1C7oPV1tDIMVQ-cKg) — x=-8601, y=-5117, w=467, h=490
- 11. **Order Address Payment** (container: nlaY0XahWzFLTNNOOCGPZ) — x=1144, y=2047, w=850, h=960
- 12. **Order Address Payment** (container: lZsHSKEkhNNKLJR2SMZd6) — x=4845, y=2087, w=850, h=960
- 13. **Shop Page** (container: n0ilEV5RyUfWszZh9LM1n) — x=-7610, y=2318, w=543, h=540
- 14. **Search** (container: 9Z5fA_EW5vGFDXfx3ABYC) — x=-8241, y=2320, w=543, h=540
- 15. **Product form view Page** (container: RM6Mb0UU-nITGeBmtblxP) — x=-6983, y=2323, w=543, h=540
- 16. **Sort By: Price** (container: PbiZJlDAAjr6Tj9IE5fBU) — x=-6370, y=2323, w=543, h=540
- 17. **Checkout** (container: PoR0bU6Sz9q37pfkxOOXl) — x=-7600, y=2968, w=543, h=540
- 18. **Checkout** (container: N2CBj69DKTXeGm8f3pu5q) — x=-8248, y=2970, w=543, h=540
- 19. **Checkout** (container: jxO4Y772JCpsAA1A2xDlo) — x=-6365, y=2973, w=543, h=540
- 20. **Checkout** (container: fYKCN7FJEdQfX2KCuOuJy) — x=-6963, y=2975, w=543, h=540

## Requirement Notes (from text blocks)

### Note 1
- Position: x=-7872, y=-13655
- Text:

~~~
- By defult a one admin user should be created.
- Type of user 
   1. Admin (with all rights)
   2. portal (normal user)
   3. Internal user (with limited rights)
- Only admin can create internal user
~~~

### Note 2
- Position: x=-7711, y=-12713
- Text:

~~~
- Check for Login Credentials
- Match creds, and allow to login a user
- If email not found then throw error "Account not exist"
  Password doesn't match throw error message. "Invalid password"
- When clicked on SignUp, Land to SignUp page and only portal user
   will be create
- When Clicked on Forget Password click on Forget Password page
~~~

### Note 3
- Position: x=-6900, y=-12707
- Text:

~~~
For Signup page
Create a 'portal user' database into the system on signup
Check credential as follows
1. Email Id should not be duplicate in database
2. Password must be unique and must contain a smalll case, a large case
and a special character and length should be in more than 8 chars.
~~~

### Note 4
- Position: x=-8458, y=-12678
- Text:

~~~
- On clicking the Submit button, display the message:
‘The password reset link has been sent to your email.
~~~

### Note 5
- Position: x=-8930, y=-12292
- Text:

~~~
Here the team need to understand the business flow, 
and accordingly need to assume some of the screen & 
create it.

When you create the new system, there must be no record
found. So when you start working it you need to create
the required data first and then you can start on the 
business flow.
~~~

### Note 6
- Position: x=-7919, y=-11365
- Text:

~~~
To create a new subscription and or see the existing one user
need to click here. On this page already existing subs will be listed.
~~~

### Note 7
- Position: x=-1016, y=-11102
- Text:

~~~
If renew and upsell is create so here one button should added on the very first subscription which
is confired like
~~~

### Note 8
- Position: x=-2483, y=-10835
- Text:

~~~
On click of Renew it should create new subscription order with same 
order line and other detauls just order date and next invoice should
be computed or added accordingly
~~~

### Note 9
- Position: x=-1672, y=-10831
- Text:

~~~
Upsell means create new order and 
change or upgrade subscription
with other prorduct
~~~

### Note 10
- Position: x=-3626, y=-10680
- Text:

~~~
once all the details save, user either can send the quotation to the client
or can directly confirm the quotation, depending upon the situation. 
 - if the quotation is send to client for the confirmation, the state of the
   sub will be change to Quotation Sent and Preview button will be appeared
   on the form.
 - if the quotation is directly confirmed , the state would be change to 
   confirm. With this some more buttons will be appeared on the form like
   Create Invoice, Cancel the Sub, Renew & Upsell.
~~~

### Note 11
- Position: x=-517, y=-10365
- Text:

~~~
default state other
 should be added according to 
close renew upsell followingly
~~~

### Note 12
- Position: x=-8122, y=-10177
- Text:

~~~
upon clicking the New button on the 
subscription page a new form view will
be open where a new sub. can be created
~~~

### Note 13
- Position: x=-8362, y=-9872
- Text:

~~~
Start typing the customer name, if it is existing one
show it in the dropdown and if not give option
to create a new one. Redirect to the user/contacts page
~~~

### Note 14
- Position: x=-4356, y=-9461
- Text:

~~~
by default the day on which the quotation is confirmed
will populate here. However this can be editable
~~~

### Note 15
- Position: x=-5131, y=-9455
- Text:

~~~
by default the login per is assigned as the Sales person
however only admin can change the Sales person
~~~

### Note 16
- Position: x=-2557, y=-9054
- Text:

~~~
Upon clicking the Create Invoice Button, redirect the user to the draft invoice page
on this page use can can either confirm the Invoice or can cancel the invoice.
till the it is not confirm it will stay in Draft state, once confirmed it will move to Confirm state.

if it is cancelled a new state will appeared as Cancelled.

When the invoice is in the cancelled state there must an option bring it back ot
draft state.
~~~

### Note 17
- Position: x=805, y=-8759
- Text:

~~~
By the Sales Order/ Sub. Order will be linked here
from Invoice page if you click on this it will redirect
user to the Subscription Form view page without having
create invoice button.
~~~

### Note 18
- Position: x=-7084, y=-8300
- Text:

~~~
once all the details are properly filled and validated user can
 - either save the changes by clicking the "Save Icon" on the left corner beside the New Button
 - or can delete the entire record, if something is wrongly enter.
~~~

### Note 19
- Position: x=-12461, y=-8177
- Text:

~~~
Every page Like subscrption, product, recurring plan, taxes like other all should have this list page where list of records for
that particular model visible.
~~~

### Note 20
- Position: x=-10081, y=-7478
- Text:

~~~
No of active subscription for particular
contact. count and on click it should
redirect list view of that.
~~~

### Note 21
- Position: x=-12792, y=-7160
- Text:

~~~
By default one contact record should be created for user and linked

here. Because one user can create multiple contact for that 
contact model is different.
~~~

### Note 22
- Position: x=-6007, y=-5220
- Text:

~~~
Billing Period first number should and after that dropdown should
be there to select it year/monthly
like 1 year or 1 month and it same applies to automatic close
~~~

### Note 23
- Position: x=-3793, y=-4306
- Text:

~~~
if this quation is selected and with this validatiy days
subscription is not confirm then that subscription
will auto close.
~~~

### Note 24
- Position: x=-8936, y=-4290
- Text:

~~~
For ex. attribute name is 
brand and it value is odoo
along with extra price 20 R.s
~~~

### Note 25
- Position: x=547, y=-4043
- Text:

~~~
If llimitusage is bool is true then it will be limited usage after
clicking on this it should ask for how many number according to 
that for that only this discount should be applicable
~~~

### Note 26
- Position: x=-1289, y=-3573
- Text:

~~~
if no product is selected then discount will be applicable
for all products. If product is selected then for particular
product applicable
~~~

### Note 27
- Position: x=-10837, y=-3191
- Text:

~~~
On click of configuration above mentioned dropdown
should come and then after selecting the option it should
navigates to the page as mentioned 

Note:- There is no page of configuration
~~~

### Note 28
- Position: x=-6346, y=-3027
- Text:

~~~
Closable/pausable/Renew means if subscription is used this recurring plan then it's for eg. closable or not and same should show
on portal if it true.
~~~

### Note 29
- Position: x=-547, y=1247
- Text:

~~~
For payment any demo or testing beta version pagment gate will work 
and accordingly page should be implemented
~~~

### Note 30
- Position: x=1273, y=1362
- Text:

~~~
For address page by default User address
should come and later on if they want to add
different that option should also be given
~~~

### Note 31
- Position: x=-1777, y=2361
- Text:

~~~
This discount should be computed on the go and 
should be shown according with difference
~~~

### Note 32
- Position: x=-2717, y=3875
- Text:

~~~
small pop up or list of variant
should come to select and accordinlyg price should vary(extra price)
~~~

### Note 33
- Position: x=-4340, y=6598
- Text:

~~~
On clicking this Renew new order should be 
created and should be visible accordingly.
~~~

## Screen-by-screen layout

### Login Page
- Container: NqYqPEavhmQP28aCpTrO-
- Bounds: x=-7727, y=-13328, w=529, h=591

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| ShW6_WLSgNW991p1MRjhl | text | 29 | 126 | 87 | 25 | Email Id |
| 5hgfQomMJkr2lhaVn0m6u | text | 31 | 237 | 93 | 25 | Password |
| RCdssnkjUNCYp899kQZ63 | rectangle | 184 | 349 | 139 | 48 |  |
| sXhMRxBYQcZOUXOufN491 | text | 228 | 360 | 51 | 25 | login |
| YLyPDgqml64AvXlIy33r3 | text | 124 | 423 | 213 | 20 | forget password ? \| sign up |

### Signup Page
- Container: YLsvLNlZLYYq-oWZsATmP
- Bounds: x=-6969, y=-13324, w=534, h=581

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| HcfjytqbBRjSX9A0HcPeO | text | 42 | 90 | 59 | 31 | Name |
| 39wvIOIAg5bK29sIqBsUC | text | 47 | 181 | 73 | 25 | Email id |
| w94bs19RvGks4AlC6u1I7 | text | 44 | 253 | 93 | 25 | Password |
| w6MnxivEwzzovyYuTk-Kc | text | 17 | 341 | 136 | 18 | Re-Enter Password |
| DJOctxvVHMTdSe0EhXtXQ | rectangle | 178 | 427 | 140 | 50 |  |
| CQ3KKL5gpCtqEpaTz3RrR | text | 224 | 442 | 49 | 20 | Signup |
| 6TrXHuMQ7UUO9aq_9zv0Q | text | 148 | 492 | 246 | 20 | signup with google or anyother |

### Reset Password Page
- Container: ctFFPePpL_B1RxeOtcEHy
- Bounds: x=-8488, y=-13186, w=575, h=451

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| tMED_zuHfDPOBmtOa9D8a | text | 130 | 28 | 239 | 38 | Reset Password |
| stGUPyPhD6PLrsL6sPz2B | text | 31 | 97 | 151 | 24 | Enter Email ID: |
| mGRxunhqCWlpX-fEGMTpT | rectangle | 17 | 216 | 488 | 98 |  |
| UfRZHDlwclRx_SffAkm28 | text | 37 | 243 | 412 | 48 | Note: The system should verify whether the entered email exists. |
| PuOwMI01Ib_IQT3sJUl28 | rectangle | 218 | 389 | 104 | 44 |  |
| 2ABAegJdOkQ_M-jnw6ko5 | text | 240 | 399 | 61 | 24 | Submit |

### Product List Page
- Container: KcOrTP6QJ-Squ7VKDGKi5
- Bounds: x=-8960, y=-12357, w=837, h=1063

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| M9wjV9_shIveVfvoCem0u | text | 30 | 65 | 795 | 280 | Here the team need to understand the business flow, and accordingly need to assume some of the screen & create it. When  |

### Shop Page
- Container: wRZVj3r3mv8f8ttJPKoZq
- Bounds: x=-7595, y=-12351, w=880, h=750

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| W33daru5DusWeFl3FWU0q | rectangle | 257 | 172 | 310 | 223 |  |
| tvhkfE85-f1ADcvWDu4t7 | text | 327 | 262 | 138 | 40 | App Icon |

### Products
- Container: BzQLIwt66luT3mjTds2PM
- Bounds: x=-7601, y=-11176, w=880, h=750

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| 6manGWWrmLy-fa-tbuTJU | rectangle | 189 | 10 | 134 | 44 |  |
| D7L2EY1_gk_ti-ge5GUWE | rectangle | 19 | 11 | 158 | 42 |  |
| Q8TGg2aD30ERKzVNDGAfO | rectangle | 569 | 13 | 126 | 45 |  |
| k-ZAOK7dJq-jducA8SRSj | rectangle | 336 | 13 | 104 | 45 |  |
| 3XDJ9INlnug3BQfuoQkNN | rectangle | 451 | 14 | 106 | 42 |  |
| _GwKYm7-NK7UJaE0UhdkW | rectangle | 718 | 18 | 141 | 36 |  |
| yB8CZ1DjPjqJep940YLGB | text | 49 | 20 | 104 | 20 | subscriptions |
| cyrQF9fhvNjTmBPZqe-0x | text | 219 | 22 | 73 | 20 | Products |
| mJ3kkKQH6Bwcjg5yJzilL | text | 351 | 25 | 78 | 20 | Reporting |
| 8vOICwyl-a6OtQYxWjnIw | text | 581 | 26 | 102 | 20 | Configuration |
| 1PTLRu9xcz-LlBaiBgFLS | text | 461 | 27 | 93 | 15 | Users/contacts |
| b5TIfv0q-c4v2lBbiRZd0 | text | 769 | 27 | 71 | 18 | My Profile |
| v_gAOU6rzCDCYWtpTpifE | rectangle | 20 | 89 | 84 | 37 |  |
| GEvJflYgySmLk307DFmCq | text | 47 | 98 | 30 | 20 | New |
| xoJdq2V8-n6rDDLygpVcK | rectangle | 232 | 99 | 301 | 27 |  |
| jfktCMZjNh-yB30VacKrB | text | 567 | 105 | 73 | 18 | search bar |
| rn2gtf8UADwQsLfxv8VpS | text | 47 | 161 | 67 | 25 | Number |
| XCmE0mNoVKdpMTixnPvpp | text | 774 | 165 | 68 | 25 | Status |
| SkBUHvfmCWU1Sgi9uNkpb | text | 162 | 165 | 90 | 25 | Customer |
| -Re16CFZuJLUMom2xbd2M | text | 503 | 166 | 90 | 25 | Recurring |
| U7K4oujfdTclhxxWovFAk | text | 329 | 166 | 124 | 25 | Next Invoice |
| VUp2lQlz6DWODQiu7lsxP | text | 655 | 167 | 40 | 25 | Plan |
| LiGsMkomwnNQ4KuEBdZx7 | text | 646 | 222 | 75 | 25 | Monthly |
| tfnUIHdKzetFwCiWqMIe_ | text | 522 | 225 | 48 | 25 | $140 |
| 77ua9aKvEXpyxedM6n-ra | text | 336 | 226 | 62 | 25 | Feb 14 |
| -wvteVYryHqnvP3GZKVME | text | 765 | 226 | 96 | 25 | Inprogess |
| E2ioubX07XCIwMpxK6VXj | text | 44 | 226 | 63 | 25 | SO001 |
| jwiaghZaEnZMj-1dUQz6X | text | 162 | 226 | 106 | 25 | Customer 1 |
| ijFCeIEf4-jglNb4Z_Ovw | text | 164 | 258 | 112 | 25 | Customer 2 |
| 70swcBZzZT6mLhkp94K6- | text | 44 | 259 | 68 | 25 | SO002 |
| TxXCgNueSMjbRBYACXIIF | text | 335 | 259 | 64 | 25 | Feb 18 |
| iB-zcuOVw_Pa_BqzWlMhR | text | 649 | 259 | 75 | 25 | Monthly |
| -ZHoNJwsvZIYWM5ovoyG4 | text | 523 | 260 | 44 | 25 | $116 |
| UR0fnxeDUAA6JYDCfoL-S | text | 764 | 262 | 76 | 25 | Chruned |
| WPyEdaQR5TPPPe4a9t-tP | text | 44 | 293 | 66 | 25 | SO003 |
| 1jrEaDLHWmMC1MzVVKXU_ | text | 726 | 293 | 152 | 25 | Quotation Sent |
| bgX_Hao2u-rKXIK1HUuMf | text | 165 | 295 | 110 | 25 | Customer 3 |
| mQ5YJc7D6GTVdkoJnkXcw | text | 338 | 295 | 64 | 25 | Feb 10 |
| mm82ZI5rZSxtwxPmeCNQ8 | text | 649 | 295 | 56 | 25 | Yearly |
| BoSqC3HVXX-yTRcyq_cfw | text | 526 | 296 | 54 | 25 | $230 |

### On click of this it should take user page
- Container: 5NVDc7kaWGnOst7BWPTCI
- Bounds: x=-9877, y=-10318, w=467, h=490

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| xY-nsfUfkknTUz_eDnxOW | text | 93 | 10 | 222 | 52 | Variants |
| MLT6eguvZy0cYBFyMBh3K | text | 60 | 120 | 304 | 55 | Recurring Plan |
| NyNDddKoG0X4CxfI3ZdQp | text | 45 | 212 | 372 | 45 | Qutotation Template |
| Kia6Ck4N4bxck74l0oy1g | text | 95 | 289 | 238 | 45 | Payment term |
| rgpl4PfYx8F27FK_4pv-M | text | 121 | 368 | 155 | 45 | Discount |
| 2OL3rIjQYXTo91h6JAlkz | text | 150 | 433 | 108 | 45 | Taxes |

### Product form view Page
- Container: 7xErP2guS4DNUKian3047
- Bounds: x=-7078, y=-8889, w=1050, h=470

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| ybTphUr9FkByT7wZtq2Wf | text | 132 | 62 | 320 | 38 | Payment term |
| XzvRJc5D14iC7hIn461e- | text | 102 | 148 | 113 | 20 | Early discount |
| YsNdrVxXm30aLPNiT6WX- | text | 110 | 177 | 99 | 28 | Due term |
| JHd2xkYlia6JzkUc9ANTu | rectangle | 106 | 222 | 378 | 146 |  |
| GwMBPOrTIh-0WXiGC7uQO | text | 330 | 230 | 43 | 20 | After |
| EVcrcFpkXrP0QeRLBstFj | text | 146 | 235 | 37 | 20 | Due |
| jA3slof5FBexPvZMdS6cc | text | 129 | 265 | 28 | 20 | 100 |
| _WfSULBYyJ20IopRtP4cJ | text | 161 | 265 | 107 | 20 | percent/fixed |
| Q13k82R1pOG7fp0GOVjPv | text | 301 | 268 | 162 | 14 | days after invoice create |

### Invoice
- Container: st5KQ50Au0JpGldbEcQar
- Bounds: x=-1512, y=-7408, w=991, h=479

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| iGEoE5T8ht9lpbYzlQYwH | text | 257 | 50 | 139 | 25 | Online or Cash |
| jNphtwjVprDbZSHgWALCD | text | 14 | 67 | 184 | 29 | payment method |
| hH0uLesJo2WgT1lADiz3P | text | 35 | 139 | 100 | 35 | Amount |
| UbEbHrnXP635QN4zNwFuN | text | 21 | 204 | 188 | 35 | Payment date |
| 79K7PWDQrnTX2mJm4jIdV | rectangle | 284 | 364 | 196 | 50 |  |
| ZGJYPAhwcU_R8stw4v9nt | rectangle | 39 | 367 | 194 | 51 |  |
| 4cHqSlhZSCX47RtbpfKJH | text | 75 | 374 | 101 | 32 | payment |
| 7OsbbUadYwoNgs4R6GBh3 | text | 338 | 376 | 103 | 35 | Discard |

### Product List Page
- Container: PK6Z1C7oPV1tDIMVQ-cKg
- Bounds: x=-8601, y=-5117, w=467, h=490

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| MAhiKXZKEQk5nhSf9LsCg | text | 85 | 25 | 223 | 60 | Attribute |
| Zly0C5e7J7Ptlh0N45HYI | text | 60 | 120 | 304 | 55 | Recurring Plan |
| vLyhdKViDQkDKyS-YJNB5 | text | 45 | 212 | 372 | 45 | Qutotation Template |
| y5DUkTrEq3EJ0N9s71Nn- | text | 95 | 289 | 238 | 45 | Payment term |
| nS9Uoxv6C3Z4pWygck50v | text | 121 | 368 | 155 | 45 | Discount |
| IAQ4Y5I-v8EI8EQvufaE_ | text | 150 | 433 | 108 | 45 | Taxes |

### Order Address Payment
- Container: nlaY0XahWzFLTNNOOCGPZ
- Bounds: x=1144, y=2047, w=850, h=960

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| Bs48yRtlo7unqFyDr_DDT | text | 567 | 67 | 118 | 62 | 1080 |
| ph4X8w_M3Wi5L00r1MvnI | text | 60 | 70 | 241 | 65 | Subtotal |
| ybvqIv1Z-o_fA0m3_tng9 | text | 583 | 160 | 88 | 62 | 120 |
| CouwU9jPoDZGP6Xl2728y | text | 77 | 167 | 172 | 72 | Taxes |
| VkIn20x8iO3-3ME59L7Xv | text | 573 | 300 | 128 | 65 | 1200 |
| 5AlXN2iw6Ta5zinD1LDGB | text | 97 | 300 | 149 | 68 | Total |
| FwJAd3V28dGIWh_KusZit | rectangle | 57 | 480 | 747 | 93 |  |
| OLnjOqiFAeDnECNCHV1NJ | rectangle | 513 | 490 | 237 | 67 |  |
| QvX2SDnYPpQr3Ohqmn5Wm | text | 587 | 501 | 90 | 45 | Apply |
| S3zZfirmi5Ir4fauGYxMJ | text | 87 | 513 | 306 | 55 | Discount code |
| OAKN1yDRyS9nl3c0P7Khf | rectangle | 60 | 640 | 683 | 117 |  |
| K86EojR49kK69gMR1nneO | text | 140 | 683 | 506 | 45 | You have successfully applied |
| vhQKy3E1p40tZ6I-4uUMt | rectangle | 117 | 797 | 623 | 113 |  |
| _T1QUwVmd23wQAoYe-n8P | text | 250 | 823 | 292 | 75 | Checkout |

### Order Address Payment
- Container: lZsHSKEkhNNKLJR2SMZd6
- Bounds: x=4845, y=2087, w=850, h=960

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| plhbMw76wb6CyEJ8Ma6Ht | ellipse | 185 | 57 | 93 | 70 |  |
| 9xKPD__uYGve0nm28ZjfM | rectangle | 50 | 98 | 170 | 137 |  |
| 28jcoi5E-_TSUksoZtUOk | text | 298 | 130 | 436 | 45 | product name 1200 |
| df5XES3-m1SJRzDL1a-7M | ellipse | 172 | 278 | 93 | 70 |  |
| 6lgvnpK6FWslwGA-8HOYz | rectangle | 52 | 313 | 170 | 137 |  |
| NxyMVcp-3_a9c8Se7gmdw | text | 262 | 373 | 393 | 45 | 10% off on your order |
| wBQ8heIOyNeB5mJAAHph0 | text | 702 | 373 | 78 | 45 | -120 |
| zra-fJJ-XLwSXoiUKoLbD | text | 557 | 593 | 118 | 62 | 1080 |
| BouE_1edxlbBQ8LeC_lRa | text | 50 | 597 | 241 | 65 | Subtotal |
| yvS4fboL7h7iaxiReaQ1M | text | 573 | 687 | 88 | 62 | 120 |
| TViPvvS3wIib8C2_pIC6Y | text | 67 | 693 | 172 | 72 | Taxes |
| I5KsAVSSu5tuSrDSAhz8k | text | 563 | 827 | 128 | 65 | 1200 |
| Yhi9vvQThfnxRdnvQ2o7i | text | 87 | 827 | 149 | 68 | Total |

### Shop Page
- Container: n0ilEV5RyUfWszZh9LM1n
- Bounds: x=-7610, y=2318, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| d8EDFq3SYqbfLhOs-6e3u | rectangle | -1210 | -599 | 3047 | 2090 |  |

### Search
- Container: 9Z5fA_EW5vGFDXfx3ABYC
- Bounds: x=-8241, y=2320, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|
| BNzL1kYt_fueKzk9GRK6U | text | 15 | 405 | 484 | 90 | Name Price Description / billing |

### Product form view Page
- Container: RM6Mb0UU-nITGeBmtblxP
- Bounds: x=-6983, y=2323, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

### Sort By: Price
- Container: PbiZJlDAAjr6Tj9IE5fBU
- Bounds: x=-6370, y=2323, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

### Checkout
- Container: PoR0bU6Sz9q37pfkxOOXl
- Bounds: x=-7600, y=2968, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

### Checkout
- Container: N2CBj69DKTXeGm8f3pu5q
- Bounds: x=-8248, y=2970, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

### Checkout
- Container: jxO4Y772JCpsAA1A2xDlo
- Bounds: x=-6365, y=2973, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

### Checkout
- Container: fYKCN7FJEdQfX2KCuOuJy
- Bounds: x=-6963, y=2975, w=543, h=540

**Key elements (relative to container)**

| id | type | x | y | w | h | text |
|---|---:|---:|---:|---:|---:|---|

