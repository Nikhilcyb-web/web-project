# Business Card (HTML + CSS)

This project is a simple **personal business card** built using plain **HTML** and **CSS**.

## Project structure

- `business.html` – the main page layout (profile photo, name/title, contact info, and social icons)
- `business.css` – all styling (background, card placement, typography, icon positioning)
- `README.md` – documentation
- `useimage/` – social icons used on the card
- `../images/profile.jpeg` – profile image used in the circle avatar

## How I created the full business card

### 1) Create the page layout (business.html)
Inside `business.html`, I used a main wrapper:

- `div.container` – the overall card “canvas”

Inside that container I added separate sections:

1. **Profile image (circle avatar)**
   - `div.card`
   - `img.card-img` pointing to `../images/profile.jpeg`
   - The circular look is done by CSS (`border-radius: 50%`).

2. **Business information block**
   - `div.card-content`
   - Contains text elements:
     - `p.name` (e.g., NIKHIL)
     - `p.title` (FULL STACK DEVELOPER)
     - `p.contact` (phone)
     - `p.email`
     - `p.address`

3. **Social icons**
   - `div.github`, `div.instagram`, `div.Leetcode`
   - Each one contains an anchor `<a>` and an `<img>`:
     - GitHub icon: `./useimage/Github-Logo-PNG.webp`
     - Instagram icon: `./useimage/instagram-logo-icon-free-png.webp`
     - LeetCode icon: `./useimage/free-leetcode-3d-icon-png-.webp`

### 2) Style the look & feel (business.css)
In `business.css`, I defined styles for both the overall container and each content block.

1. **Reset + background**
   - `* { margin: 0; padding: 0; }`
   - `body { background-color: #b42a2a; }`

2. **Main container (gradient panel)**
   - `.container`:
     - fixed size (`width: 560px; height: 300px;`)
     - positioned using `margin-top` and `margin-left`
     - uses flex to center items (`display: flex; flex-direction: column; justify-content: center; align-items: center;`)
     - gets the gradient background:
       `background-image: linear-gradient(50deg,#94BBE9,#e085ab);`

3. **Circular profile image**
   - `.card` and `.card-img`:
     - `.card-img` uses `width/height: 150px` and `border-radius: 50%`
     - this produces the round avatar.

4. **Text block placement and coloring**
   - `.card-content` is positioned using absolute positioning:
     - `position: absolute; top: 180px; left: 670px;`
   - `.card-content` has a solid background color `#e085ab`.
   - Each line of text (name/title/contact/email/address) has its own font size, font family, and alignment via classes like:
     - `.name`, `.title`, `.contact`, `.email`, `.address`

5. **Social icon positioning**
   - Each icon wrapper is positioned absolutely:
     - `.github { position: absolute; top: 350px; right: 780px; }`
     - `.instagram { position: absolute; top: 350px; right: 700px; }`
     - `.Leetcode { position: absolute; top: 350px; right: 620px; }`
   - Icons use `.github-icon`, `.insta-icon`, `.leetcode-icon` with fixed `60px` size and `object-fit: cover`.

## How to run it
1. Open `business.html` in your browser.
2. Ensure the image paths exist:
   - `../images/profile.jpeg`
   - `useimage/*.webp`

That’s it—the HTML creates the structure, and the CSS handles the layout, gradient background, typography, circular avatar, and icon placement.
