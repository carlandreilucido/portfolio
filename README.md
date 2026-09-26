# Carl Andrei Lucido - Developer Portfolio

A responsive personal portfolio for Carl Andrei Lucido, a third-year BS Computer Science student and web developer. The site presents Carl's background, technical skills, selected systems, and a Supabase-backed contact form in a focused single-page experience.

## Screenshots

The portfolio includes complete light and dark themes and responsive layouts for desktop, tablet, and mobile. Project preview artwork is rendered directly with HTML and CSS so the static deployment does not depend on stock imagery or unavailable project screenshots.

After deployment, current page captures can be added here for release documentation.

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Supabase JavaScript client and PostgreSQL

No package manager, build process, PHP runtime, or JavaScript framework is required.

## Features

- Responsive editorial-style layout built with the Bootstrap grid
- Actual professional profile photo supplied with the project
- Persistent light and dark themes with system preference detection
- Sticky navigation with an active-section indicator
- Automatically closing mobile navigation
- Accessible labels, focus states, landmarks, and reduced-motion support
- Four project cards with custom interface previews and honest availability states
- Working external demo link for the Food Ordering System
- Validated contact form with loading, success, and error states
- Anonymous contact message inserts through Supabase Row Level Security
- SEO, Open Graph, theme-color, and favicon metadata
- Static-hosting-compatible relative paths

## Project Structure

```text
portfolio/
|-- index.html
|-- README.md
|-- assets/
|   `-- icons/
|       `-- favicon.svg
|-- css/
|   `-- style.css
|-- js/
|   |-- contact.js
|   |-- main.js
|   |-- supabase.js
|   `-- theme.js
|-- profile-pic/
|   `-- me.jpg
`-- supabase/
    `-- setup.sql
```

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/carlandreilucido/portfolio.git
   cd portfolio
   ```

2. Serve the folder with any static web server. For example:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in a browser.

Opening `index.html` directly is sufficient for most visual checks, but a local server more closely matches production behavior.

## Supabase Setup

The frontend is configured for the supplied Supabase project in `js/supabase.js`. The public publishable key is intentionally safe for browser use when Row Level Security is configured correctly.

1. Sign in to [Supabase](https://supabase.com/) and open the relevant project.
2. Open **SQL Editor** and create a new query.
3. Copy the contents of `supabase/setup.sql` into the editor.
4. Select **Run**.
5. Confirm that `public.contact_messages` appears in **Table Editor**.
6. In **Authentication > Policies** or the table policy view, confirm that only the anonymous `INSERT` policy exists for this table.
7. Submit a test message from the portfolio and verify it in the Supabase dashboard.

The SQL creates a UUID primary key, a UTC-compatible timestamp, field length constraints, Row Level Security, and an anonymous insert-only policy. It does not grant anonymous read access.

## Deployment

### GitHub Pages

1. Push the project to the `main` branch.
2. In the GitHub repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then save.
5. GitHub Pages will publish the site at `https://carlandreilucido.github.io/portfolio/`.

All site paths are relative, so the project works correctly from the `/portfolio/` repository path.

### Vercel

1. Import `https://github.com/carlandreilucido/portfolio` into Vercel.
2. Select **Other** as the framework preset if prompted.
3. Leave the build command empty.
4. Use `.` as the output/root directory.
5. Deploy.

No environment variables are required for the current public Supabase client configuration.

## Security Notes

- Supabase Row Level Security must remain enabled on `contact_messages`.
- The browser client performs `INSERT` operations only.
- The publishable key in `js/supabase.js` is a public frontend credential; database policies are the security boundary.
- A Supabase `service_role` key bypasses Row Level Security and must **NEVER** be committed to the repository or exposed in frontend JavaScript.
- For a high-traffic public deployment, consider adding CAPTCHA and server-side rate limiting to reduce automated form spam.
- Review contact messages only from the authenticated Supabase dashboard or another trusted administrative environment.

## Contact

- Email: [carlandreirubialucido@gmail.com](mailto:carlandreirubialucido@gmail.com)
- GitHub: [github.com/carlandreilucido](https://github.com/carlandreilucido)
