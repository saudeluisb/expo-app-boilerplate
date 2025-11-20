export type FontCategory = 'sansSerif' | 'serif' | 'display';

export type FontOption = {
  id: string;
  name: string;
  category: FontCategory;
  previewName?: string;
  weight?: 'regular' | 'medium' | 'bold';
  remoteUri: string;
};

export const FONT_OPTIONS: FontOption[] = [
  // Sans serif
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.ttf',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/opensans/v36/mem8YaGs126MiZpBA-U1UpcaXcl0Aw.ttf',
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wWyWrFCc.ttf',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/montserrat/v25/JTUQjIg1_i6t8kCHKm45_Q.ttf',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfedA.ttf',
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrKsb8FU0.ttf',
  },
  {
    id: 'noto-sans',
    name: 'Noto Sans',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/notosans/v39/o-0IIpQlx3QUlC5A4PNr6.ttf',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaB.ttf',
  },
  {
    id: 'work-sans',
    name: 'Work Sans',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/worksans/v18/QGYsz_wNahGAdqQ43Rh_cg.ttf',
  },
  {
    id: 'source-sans-pro',
    name: 'Source Sans Pro',
    category: 'sansSerif',
    remoteUri: 'https://fonts.gstatic.com/s/sourcesanspro/v24/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7g.ttf',
  },

  // Serif
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-eE0.ttf',
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/playfairdisplay/v29/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYg.ttf',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/lora/v32/0QIhMX1D_JOuMw_LLPtLtfOm84K6lQ.ttf',
  },
  {
    id: 'pt-serif',
    name: 'PT Serif',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/ptserif/v17/EJRVQgYoZZY2vCFuvDFR8w.ttf',
  },
  {
    id: 'noto-serif',
    name: 'Noto Serif',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/notoserif/v25/ga6Iaw1J5X9T9RW6j9bNfFI.ttf',
  },
  {
    id: 'crimson-text',
    name: 'Crimson Text',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/crimsontext/v19/wlpogwHKFkZgtmSR3NB0oRJXB6UB.ttf',
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi6aVXN.ttf',
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/librebaskerville/v12/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNc.ttf',
  },
  {
    id: 'bitter',
    name: 'Bitter',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/bitter/v28/rax8HiqOu8IVPmn8K-s.ttf',
  },
  {
    id: 'roboto-slab',
    name: 'Roboto Slab',
    category: 'serif',
    remoteUri: 'https://fonts.gstatic.com/s/robotoslab/v24/BngMUXZYTXPIvIBgJJSb6ufN5qU.ttf',
  },

  // Display / script
  {
    id: 'oswald',
    name: 'Oswald',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/oswald/v49/TK3iWkUHHAIjg752GT8.ttf',
  },
  {
    id: 'anton',
    name: 'Anton',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/anton/v24/1Ptgg87LROyAm3K9-Ck.ttf',
  },
  {
    id: 'lobster',
    name: 'Lobster',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/lobster/v28/neILzCirqoswsqX9_oWsMqEzSJQ.ttf',
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.ttf',
  },
  {
    id: 'abril-fatface',
    name: 'Abril Fatface',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/abrilfatface/v19/zOL64pLDlL1D99S8g8PtiKchq-lm.ttf',
  },
  {
    id: 'fredoka-one',
    name: 'Fredoka One',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/fredokaone/v15/k3kUo8kEI-tA1RRcTZGmTlHGCaQ.ttf',
  },
  {
    id: 'righteous',
    name: 'Righteous',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/righteous/v15/1cXxaUPXBpj2rGoU7C9W6w.ttf',
  },
  {
    id: 'bangers',
    name: 'Bangers',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/bangers/v17/FeVQS0BTqb0h60ACH5FQ2w.ttf',
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/dancingscript/v24/If2RXTr6YS-zF4S-kcSWSVi_szMZ.ttf',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    category: 'display',
    remoteUri: 'https://fonts.gstatic.com/s/cinzel/v18/8vIJ7ww63mVu7gt79mT-.ttf',
  },
];

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'sansSerif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display & Script' },
];

export const DEFAULT_FONT_ID = 'inter';
