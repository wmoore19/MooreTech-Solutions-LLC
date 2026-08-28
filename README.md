# MooreTech Solutions LLC

The official company website for [MooreTech Solutions LLC](https://mooretech-solutions-llc.base44.app/) — a Northeast Arkansas technology company building practical software products and carefully scoped custom systems for real-world operations.

## Live websites

- **MooreTech Solutions LLC:** [mooretech-solutions-llc.base44.app](https://mooretech-solutions-llc.base44.app/)
- **Ironline Office:** [ironlineoffice.com](https://ironlineoffice.com/) — service operations software
- **Ironline Budget:** [ironlinebudget.com](https://ironlinebudget.com/) — personal, family, and business financial planning
- **Ironline Launch:** [ironlinelaunch.com](https://ironlinelaunch.com/) — guided Arkansas business setup

## What this site includes

- Company overview and leadership
- Product portfolio featuring Ironline Office, Ironline Budget, and Ironline Launch
- Dedicated product paths for service operations, financial planning, and guided Arkansas business setup
- Custom software request process and qualification guidance
- Secure inquiry capture with administrator-only records
- Careers and résumé submission information
- Contact options, with texting encouraged
- Route-specific metadata, structured data, sitemap, and social previews
- Privacy, website terms, and security/data-practices pages
- Privacy-conscious first-party event tracking

## Technology

- React
- Vite
- React Router
- Base44 hosting, entities, backend functions, email integration, and analytics
- GitHub two-way sync with the Base44 project

## Local development

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

To run the full Base44 development environment, install the current Base44 CLI and run:

```bash
base44 dev
```

The app configuration is stored in `base44/config.jsonc`. Backend resources live under `base44/`, including the protected inquiry entity and submission function.

## Build checks

```bash
npm run build
npm run lint
```

## Base44 and GitHub workflow

This repository is connected to the MooreTech Base44 app with two-way sync. Repository changes are reflected in the Base44 Builder; publishing the public website is completed from Base44 after review and testing.

Do not commit credentials, tokens, private customer information, or production secrets. Base44-managed secrets and service configuration should remain outside public source code.

## Contact

Texting is encouraged: [870-819-1018](sms:+18708191018)

Email: [admin@ironlineoffice.com](mailto:admin@ironlineoffice.com)

For custom software requests, include the current process, where time or information is being lost, who would use the system, and what a useful result would look like.
