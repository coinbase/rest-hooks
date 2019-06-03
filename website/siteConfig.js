/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Coinbase',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/docusaurus.svg'.
    image: '/img/coinbase-logo.svg',
    infoLink: 'https://www.coinbase.com',
    pinned: true,
  },
];

const baseUrl = '/';

const siteConfig = {
  title: 'Rest Hooks', // Title for your website.
  tagline: 'Delightful data fetching',
  url: 'https://resthooks.io', // Your website URL
  baseUrl, // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',
  cname: 'resthooks.io',
  algolia: {
    apiKey: '52e661c10738fd114bcf68d537358c16',
    indexName: 'coinbase-rest-hooks',
    algoliaOptions: {},
  },
  gaTrackingId: 'UA-138752992-1',

  // Used for publishing and more
  projectName: 'rest-hooks',
  organizationName: 'coinbase',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started/installation', label: 'Getting Started' },
    { doc: 'api/README', label: 'API' },
    { doc: 'guides/README', label: 'Guides' },
    { href: 'https://www.github.com/coinbase/rest-hooks', label: 'Github' },
    { href: 'https://stackblitz.com/edit/rest-hooks', label: '🎮 Demo' },
    //{ page: 'help', label: 'Help' },
    { search: true },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/rest_hooks_logo.svg',
  footerIcon: 'img/rest_hooks_logo.svg',
  favicon: 'img/favicon/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#633EFF',
    secondaryColor: 'rgb(22, 82, 240);',
  },

  /* Custom fonts for website */

  fonts: {
    sansFont: [
      'Graphik',
      'Avenir Next',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Coinbase`,


  usePrism: true,

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    `${baseUrl}scripts/sidebarScroll.js`,
    `${baseUrl}scripts/codeblock.js`,
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    'https://buttons.github.io/buttons.js',
  ],
  //stylesheets: [`/css/font.css`, `/css/code-block-buttons.css`],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  docsSideNavCollapsible: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/rest_hooks_logo.png',
  twitterImage: 'img/rest_hooks_logo.png',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/coinbase/rest-hooks',
};

module.exports = siteConfig;
