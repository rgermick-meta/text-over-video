// Comprehensive Google Fonts with rich style descriptions for AI-driven font selection

export interface FontMetadata {
  name: string;
  category: string;
  description: string;
  tags: string[];
  useCases: string[];
}

export const FONT_METADATA: FontMetadata[] = [
  // DISPLAY FONTS - Bold, attention-grabbing
  {
    name: 'Bebas Neue',
    category: 'display',
    description: 'Bold, condensed, all-caps style. Perfect for headlines and movie posters.',
    tags: ['bold', 'condensed', 'uppercase', 'modern', 'strong', 'masculine'],
    useCases: ['movie poster', 'sports', 'action', 'headline', 'billboard', 'athletic']
  },
  {
    name: 'Anton',
    category: 'display',
    description: 'Heavy, impactful sans-serif. Great for bold statements and advertising.',
    tags: ['heavy', 'bold', 'impact', 'sans-serif', 'strong'],
    useCases: ['poster', 'headline', 'advertising', 'bold statement', 'emphasis']
  },
  {
    name: 'Righteous',
    category: 'display',
    description: 'Geometric, retro-futuristic with 80s vibes.',
    tags: ['geometric', 'retro', '80s', 'futuristic', 'bold'],
    useCases: ['retro', '80s', 'synthwave', 'neon', 'video game', 'arcade']
  },
  {
    name: 'Bungee',
    category: 'display',
    description: 'Urban, blocky style inspired by street signage.',
    tags: ['urban', 'blocky', 'street', 'geometric', 'bold'],
    useCases: ['urban', 'street art', 'graffiti', 'modern', 'tech']
  },
  {
    name: 'Alfa Slab One',
    category: 'display',
    description: 'Ultra-bold slab serif for maximum impact.',
    tags: ['ultra-bold', 'slab', 'thick', 'heavy', 'strong'],
    useCases: ['poster', 'billboard', 'bold headline', 'emphasis', 'attention']
  },
  {
    name: 'Archivo Black',
    category: 'display',
    description: 'Heavy grotesque sans-serif, strong and bold.',
    tags: ['heavy', 'bold', 'grotesque', 'sans-serif', 'strong'],
    useCases: ['headline', 'bold', 'poster', 'emphasis']
  },
  {
    name: 'Black Ops One',
    category: 'display',
    description: 'Military stencil style, aggressive and tactical.',
    tags: ['military', 'stencil', 'tactical', 'aggressive', 'war'],
    useCases: ['military', 'war', 'action', 'tactical', 'stencil', 'army']
  },
  {
    name: 'Turret Road',
    category: 'display',
    description: 'Industrial, mechanical, heavy machinery aesthetic.',
    tags: ['industrial', 'mechanical', 'heavy', 'tech', 'robotic'],
    useCases: ['industrial', 'machinery', 'robot', 'tech', 'mechanical']
  },
  {
    name: 'Teko',
    category: 'display',
    description: 'Narrow, condensed, technical and modern.',
    tags: ['narrow', 'condensed', 'technical', 'modern', 'geometric'],
    useCases: ['tech', 'modern', 'minimal', 'condensed', 'interface']
  },
  {
    name: 'Staatliches',
    category: 'display',
    description: 'Compressed, bureaucratic, institutional feel.',
    tags: ['compressed', 'institutional', 'official', 'geometric'],
    useCases: ['official', 'government', 'institutional', 'formal', 'compressed']
  },

  // MODERN FONTS - Clean, professional
  {
    name: 'Poppins',
    category: 'modern',
    description: 'Geometric sans-serif, clean and professional. Perfect for modern branding.',
    tags: ['geometric', 'modern', 'clean', 'professional', 'sans-serif'],
    useCases: ['modern', 'business', 'professional', 'clean', 'corporate', 'tech']
  },
  {
    name: 'Montserrat',
    category: 'modern',
    description: 'Urban, geometric, inspired by old Buenos Aires posters.',
    tags: ['geometric', 'urban', 'modern', 'clean', 'versatile'],
    useCases: ['modern', 'urban', 'clean', 'professional', 'versatile']
  },
  {
    name: 'Inter',
    category: 'modern',
    description: 'Screen-optimized, highly legible, designed for interfaces.',
    tags: ['interface', 'screen', 'legible', 'modern', 'clean'],
    useCases: ['interface', 'UI', 'digital', 'modern', 'clean', 'professional']
  },
  {
    name: 'Raleway',
    category: 'modern',
    description: 'Elegant sans-serif with a unique W. Modern and sophisticated.',
    tags: ['elegant', 'modern', 'sophisticated', 'sans-serif', 'clean'],
    useCases: ['modern', 'elegant', 'professional', 'sophisticated', 'clean']
  },
  {
    name: 'Work Sans',
    category: 'modern',
    description: 'Optimized for work, clean and professional.',
    tags: ['clean', 'professional', 'work', 'modern', 'sans-serif'],
    useCases: ['work', 'professional', 'clean', 'modern', 'business']
  },
  {
    name: 'DM Sans',
    category: 'modern',
    description: 'Low contrast, geometric, modern sans-serif.',
    tags: ['geometric', 'modern', 'clean', 'low-contrast', 'sans-serif'],
    useCases: ['modern', 'clean', 'professional', 'minimal']
  },
  {
    name: 'Outfit',
    category: 'modern',
    description: 'Rounded, friendly, modern sans-serif.',
    tags: ['rounded', 'friendly', 'modern', 'clean', 'approachable'],
    useCases: ['modern', 'friendly', 'approachable', 'clean', 'casual']
  },
  {
    name: 'Manrope',
    category: 'modern',
    description: 'Modern geometric sans-serif with open forms.',
    tags: ['geometric', 'modern', 'open', 'clean', 'friendly'],
    useCases: ['modern', 'clean', 'friendly', 'professional']
  },
  {
    name: 'Sora',
    category: 'modern',
    description: 'Technological, modern, designed for digital interfaces.',
    tags: ['tech', 'modern', 'digital', 'clean', 'interface'],
    useCases: ['tech', 'digital', 'modern', 'interface', 'futuristic']
  },
  {
    name: 'Red Hat Display',
    category: 'modern',
    description: 'Corporate, professional, tech company aesthetic.',
    tags: ['corporate', 'professional', 'tech', 'modern', 'clean'],
    useCases: ['corporate', 'tech', 'professional', 'business']
  },

  // CLASSIC/SERIF FONTS - Traditional, elegant
  {
    name: 'Playfair Display',
    category: 'classic',
    description: 'High contrast serif, elegant and sophisticated. Perfect for luxury brands.',
    tags: ['serif', 'elegant', 'sophisticated', 'luxury', 'traditional'],
    useCases: ['luxury', 'elegant', 'sophisticated', 'traditional', 'classy', 'fashion']
  },
  {
    name: 'Merriweather',
    category: 'classic',
    description: 'Readable serif designed for screens, traditional feel.',
    tags: ['serif', 'readable', 'traditional', 'classic', 'editorial'],
    useCases: ['traditional', 'editorial', 'reading', 'classic', 'book']
  },
  {
    name: 'Lora',
    category: 'classic',
    description: 'Brushed curves, calligraphic style, elegant serif.',
    tags: ['serif', 'calligraphic', 'elegant', 'classic', 'readable'],
    useCases: ['elegant', 'classic', 'editorial', 'traditional']
  },
  {
    name: 'Crimson Text',
    category: 'classic',
    description: 'Book typography inspired, classic serif for body text.',
    tags: ['serif', 'classic', 'book', 'traditional', 'readable'],
    useCases: ['book', 'traditional', 'editorial', 'classic', 'reading']
  },
  {
    name: 'Cormorant',
    category: 'classic',
    description: 'Display serif with classical proportions, elegant.',
    tags: ['serif', 'display', 'classical', 'elegant', 'sophisticated'],
    useCases: ['elegant', 'sophisticated', 'classical', 'luxury', 'fashion']
  },
  {
    name: 'Libre Baskerville',
    category: 'classic',
    description: 'Classic Baskerville revival, traditional serif.',
    tags: ['serif', 'classic', 'traditional', 'baskerville', 'elegant'],
    useCases: ['traditional', 'classic', 'editorial', 'book', 'elegant']
  },
  {
    name: 'EB Garamond',
    category: 'classic',
    description: 'Classical Garamond revival, scholarly and traditional.',
    tags: ['serif', 'classical', 'traditional', 'scholarly', 'book'],
    useCases: ['traditional', 'scholarly', 'academic', 'book', 'editorial']
  },
  {
    name: 'Spectral',
    category: 'classic',
    description: 'Elegant serif optimized for digital reading.',
    tags: ['serif', 'elegant', 'digital', 'readable', 'modern-classic'],
    useCases: ['editorial', 'digital', 'elegant', 'reading']
  },
  {
    name: 'Cinzel',
    category: 'classic',
    description: 'Based on Roman inscriptions, classical and formal.',
    tags: ['serif', 'roman', 'classical', 'formal', 'elegant', 'ancient'],
    useCases: ['classical', 'formal', 'elegant', 'ancient', 'roman', 'historical']
  },
  {
    name: 'Yeseva One',
    category: 'classic',
    description: 'Victorian era inspired, decorative display serif.',
    tags: ['serif', 'victorian', 'decorative', 'vintage', 'display'],
    useCases: ['victorian', 'vintage', 'decorative', 'elegant', 'old-fashioned']
  },

  // FUN/PLAYFUL FONTS
  {
    name: 'Fredoka One',
    category: 'fun',
    description: 'Rounded, bouncy, friendly and fun. Great for kids content.',
    tags: ['rounded', 'bouncy', 'fun', 'friendly', 'playful', 'children'],
    useCases: ['kids', 'playful', 'fun', 'friendly', 'children', 'cartoon']
  },
  {
    name: 'Pacifico',
    category: 'fun',
    description: 'Surf-inspired brush script, casual and beachy.',
    tags: ['script', 'brush', 'casual', 'surf', 'beach', 'handwritten'],
    useCases: ['beach', 'surf', 'casual', 'tropical', 'vacation', 'summer']
  },
  {
    name: 'Lobster',
    category: 'fun',
    description: 'Bold retro script, 1950s diner aesthetic.',
    tags: ['script', 'retro', '50s', 'diner', 'bold', 'vintage'],
    useCases: ['retro', '50s', 'diner', 'vintage', 'restaurant', 'americana']
  },
  {
    name: 'Permanent Marker',
    category: 'fun',
    description: 'Handwritten marker style, casual and informal.',
    tags: ['handwritten', 'marker', 'casual', 'informal', 'sketch'],
    useCases: ['handwritten', 'casual', 'sketch', 'informal', 'marker', 'doodle']
  },
  {
    name: 'Bangers',
    category: 'fun',
    description: 'Comic book style, energetic and explosive.',
    tags: ['comic', 'energetic', 'bold', 'cartoon', 'explosive'],
    useCases: ['comic book', 'cartoon', 'explosive', 'action', 'pop art', 'superhero']
  },
  {
    name: 'Concert One',
    category: 'fun',
    description: 'Rounded, friendly display font for posters.',
    tags: ['rounded', 'friendly', 'display', 'fun', 'approachable'],
    useCases: ['fun', 'friendly', 'poster', 'playful']
  },
  {
    name: 'Luckiest Guy',
    category: 'fun',
    description: 'Bold, bubbly, vintage advertising style.',
    tags: ['bold', 'bubbly', 'vintage', 'advertising', 'retro'],
    useCases: ['vintage', 'retro', 'advertising', 'bold', 'bubble']
  },
  {
    name: 'Chewy',
    category: 'fun',
    description: 'Soft, gooey, candy-like display font.',
    tags: ['soft', 'candy', 'sweet', 'playful', 'rounded'],
    useCases: ['candy', 'sweet', 'kids', 'playful', 'fun']
  },
  {
    name: 'Bungee Shade',
    category: 'fun',
    description: '3D layered effect, urban and playful.',
    tags: ['3d', 'layered', 'urban', 'playful', 'street'],
    useCases: ['3d', 'urban', 'playful', 'street', 'pop']
  },
  {
    name: 'Righteous',
    category: 'fun',
    description: 'Retro futuristic, 80s inspired.',
    tags: ['retro', '80s', 'futuristic', 'geometric', 'bold'],
    useCases: ['80s', 'retro', 'synthwave', 'arcade', 'neon']
  },

  // ELEGANT/SCRIPT FONTS
  {
    name: 'Great Vibes',
    category: 'elegant',
    description: 'Flowing script, elegant and romantic.',
    tags: ['script', 'elegant', 'romantic', 'flowing', 'handwritten', 'cursive'],
    useCases: ['elegant', 'wedding', 'romantic', 'invitation', 'cursive', 'fancy']
  },
  {
    name: 'Dancing Script',
    category: 'elegant',
    description: 'Casual script with bouncing baseline, friendly elegance.',
    tags: ['script', 'casual', 'bouncy', 'friendly', 'handwritten'],
    useCases: ['casual elegant', 'friendly', 'invitation', 'handwritten']
  },
  {
    name: 'Allura',
    category: 'elegant',
    description: 'Formal script, sophisticated calligraphy.',
    tags: ['script', 'formal', 'calligraphy', 'sophisticated', 'elegant'],
    useCases: ['formal', 'elegant', 'wedding', 'calligraphy', 'sophisticated']
  },
  {
    name: 'Tangerine',
    category: 'elegant',
    description: 'Delicate script, light and airy.',
    tags: ['script', 'delicate', 'light', 'airy', 'feminine'],
    useCases: ['delicate', 'feminine', 'elegant', 'light', 'invitation']
  },
  {
    name: 'Alex Brush',
    category: 'elegant',
    description: 'Brush script, fluid and expressive.',
    tags: ['script', 'brush', 'fluid', 'expressive', 'handwritten'],
    useCases: ['elegant', 'expressive', 'handwritten', 'wedding', 'signature']
  },
  {
    name: 'Satisfy',
    category: 'elegant',
    description: 'Casual handwriting, personal and warm.',
    tags: ['script', 'handwriting', 'casual', 'personal', 'warm'],
    useCases: ['handwritten', 'personal', 'casual', 'friendly', 'warm']
  },
  {
    name: 'Parisienne',
    category: 'elegant',
    description: 'Parisian elegance, refined script.',
    tags: ['script', 'parisian', 'elegant', 'refined', 'sophisticated'],
    useCases: ['parisian', 'elegant', 'sophisticated', 'fashion', 'luxury']
  },
  {
    name: 'Sacramento',
    category: 'elegant',
    description: 'Monoline script, clean and elegant.',
    tags: ['script', 'monoline', 'clean', 'elegant', 'simple'],
    useCases: ['elegant', 'clean', 'simple', 'modern script', 'handwritten']
  },
  {
    name: 'Kaushan Script',
    category: 'elegant',
    description: 'Brush lettering, organic and casual.',
    tags: ['script', 'brush', 'organic', 'casual', 'handwritten'],
    useCases: ['brush', 'organic', 'casual', 'handwritten', 'modern']
  },
  {
    name: 'Cookie',
    category: 'elegant',
    description: 'Sweet brush script, whimsical and light.',
    tags: ['script', 'brush', 'whimsical', 'light', 'sweet'],
    useCases: ['whimsical', 'sweet', 'light', 'handwritten', 'feminine']
  },

  // TECH/MONOSPACE FONTS
  {
    name: 'Roboto Mono',
    category: 'tech',
    description: 'Monospace, coding, technical and precise.',
    tags: ['monospace', 'coding', 'technical', 'precise', 'programming'],
    useCases: ['code', 'programming', 'technical', 'computer', 'developer', 'hacker']
  },
  {
    name: 'Space Mono',
    category: 'tech',
    description: 'Retro-futuristic monospace, space age aesthetic.',
    tags: ['monospace', 'retro', 'futuristic', 'space', 'technical'],
    useCases: ['retro', 'space', 'technical', 'futuristic', 'sci-fi', 'code']
  },
  {
    name: 'Fira Code',
    category: 'tech',
    description: 'Programming font with ligatures, developer favorite.',
    tags: ['monospace', 'programming', 'code', 'ligatures', 'technical'],
    useCases: ['programming', 'code', 'developer', 'technical', 'hacker']
  },
  {
    name: 'Courier Prime',
    category: 'tech',
    description: 'Typewriter style, classic mechanical typing aesthetic.',
    tags: ['monospace', 'typewriter', 'classic', 'mechanical', 'vintage'],
    useCases: ['typewriter', 'vintage', 'mechanical', 'screenplay', 'document']
  },
  {
    name: 'JetBrains Mono',
    category: 'tech',
    description: 'Modern coding font, highly legible for programmers.',
    tags: ['monospace', 'coding', 'modern', 'legible', 'programming'],
    useCases: ['coding', 'programming', 'developer', 'technical', 'modern']
  },
  {
    name: 'IBM Plex Mono',
    category: 'tech',
    description: 'Corporate monospace, professional and technical.',
    tags: ['monospace', 'corporate', 'professional', 'technical', 'IBM'],
    useCases: ['corporate', 'technical', 'professional', 'coding', 'business']
  },
  {
    name: 'Source Code Pro',
    category: 'tech',
    description: 'Adobe coding font, clean and professional.',
    tags: ['monospace', 'coding', 'clean', 'professional', 'technical'],
    useCases: ['coding', 'programming', 'technical', 'professional', 'developer']
  },
  {
    name: 'Anonymous Pro',
    category: 'tech',
    description: 'Fixed-width font for programming, hacker aesthetic.',
    tags: ['monospace', 'programming', 'hacker', 'fixed-width', 'technical'],
    useCases: ['hacker', 'programming', 'code', 'technical', 'terminal']
  },
  {
    name: 'Inconsolata',
    category: 'tech',
    description: 'Humanist monospace, friendly coding font.',
    tags: ['monospace', 'humanist', 'coding', 'friendly', 'programming'],
    useCases: ['coding', 'programming', 'friendly', 'developer', 'technical']
  },
  {
    name: 'VT323',
    category: 'tech',
    description: 'Old terminal screen style, vintage computing.',
    tags: ['monospace', 'terminal', 'vintage', 'retro', 'computer', 'pixel'],
    useCases: ['terminal', 'vintage computer', 'retro', 'hacker', 'DOS', 'pixel']
  },

  // ADDITIONAL DISPLAY/HEADLINE FONTS
  {
    name: 'Oswald',
    category: 'display',
    description: 'Condensed gothic, newspaper headline style.',
    tags: ['condensed', 'gothic', 'headline', 'newspaper', 'bold'],
    useCases: ['headline', 'newspaper', 'editorial', 'condensed', 'bold']
  },
  {
    name: 'Russo One',
    category: 'display',
    description: 'Bold sans-serif with unique character, impactful.',
    tags: ['bold', 'unique', 'impactful', 'display', 'strong'],
    useCases: ['headline', 'bold', 'impactful', 'unique', 'strong']
  },
  {
    name: 'Abril Fatface',
    category: 'display',
    description: 'High contrast display serif, dramatic headlines.',
    tags: ['display', 'serif', 'high-contrast', 'dramatic', 'bold'],
    useCases: ['dramatic', 'headline', 'fashion', 'magazine', 'editorial']
  },
  {
    name: 'Faster One',
    category: 'display',
    description: 'Speed-inspired, racing and motion aesthetic.',
    tags: ['speed', 'racing', 'motion', 'dynamic', 'fast'],
    useCases: ['racing', 'speed', 'sports', 'fast', 'motion', 'automotive']
  },
  {
    name: 'Orbitron',
    category: 'display',
    description: 'Futuristic, geometric, space and technology themed.',
    tags: ['futuristic', 'geometric', 'space', 'tech', 'sci-fi'],
    useCases: ['futuristic', 'sci-fi', 'space', 'technology', 'modern', 'alien']
  },
  {
    name: 'Press Start 2P',
    category: 'display',
    description: 'Pixel art, 8-bit video game aesthetic.',
    tags: ['pixel', '8-bit', 'video-game', 'retro', 'arcade'],
    useCases: ['video game', 'arcade', 'retro gaming', '8-bit', 'pixel art', 'gaming']
  },
  {
    name: 'Audiowide',
    category: 'display',
    description: 'Techno, electronic music and digital aesthetic.',
    tags: ['techno', 'electronic', 'digital', 'modern', 'tech'],
    useCases: ['electronic', 'techno', 'music', 'digital', 'modern', 'club']
  },
  {
    name: 'Wallpoet',
    category: 'display',
    description: 'Graffiti-inspired, urban street art style.',
    tags: ['graffiti', 'urban', 'street-art', 'spray-paint', 'bold'],
    useCases: ['graffiti', 'street art', 'urban', 'spray paint', 'hip-hop']
  },
  {
    name: 'Creepster',
    category: 'display',
    description: 'Horror, spooky, Halloween themed.',
    tags: ['horror', 'spooky', 'halloween', 'creepy', 'scary'],
    useCases: ['halloween', 'horror', 'spooky', 'scary', 'creepy', 'dark']
  },
  {
    name: 'Nosifer',
    category: 'display',
    description: 'Zombie, horror movie aesthetic.',
    tags: ['zombie', 'horror', 'dripping', 'scary', 'halloween'],
    useCases: ['zombie', 'horror', 'halloween', 'scary', 'blood', 'dripping']
  },
  {
    name: 'Monoton',
    category: 'display',
    description: 'Art deco, geometric, retro futuristic.',
    tags: ['art-deco', 'geometric', 'retro', 'lines', 'striped'],
    useCases: ['art deco', 'retro', 'geometric', 'vintage', '20s']
  },
  {
    name: 'Shrikhand',
    category: 'display',
    description: 'Bollywood, Indian cinema inspired.',
    tags: ['bollywood', 'indian', 'decorative', 'curved', 'exotic'],
    useCases: ['bollywood', 'indian', 'exotic', 'decorative', 'cultural']
  },
  {
    name: 'Fredericka the Great',
    category: 'display',
    description: 'Western, wild west, wanted poster style.',
    tags: ['western', 'wild-west', 'vintage', 'ornate', 'cowboy'],
    useCases: ['western', 'wild west', 'cowboy', 'wanted poster', 'saloon']
  },
  {
    name: 'Rye',
    category: 'display',
    description: 'Western ornate, Victorian woodblock printing.',
    tags: ['western', 'ornate', 'victorian', 'decorative', 'vintage'],
    useCases: ['western', 'vintage', 'victorian', 'ornate', 'decorative']
  },
  {
    name: 'Vast Shadow',
    category: 'display',
    description: 'Bold 3D shadow effect, dramatic depth.',
    tags: ['3d', 'shadow', 'bold', 'dramatic', 'dimensional'],
    useCases: ['3d', 'dramatic', 'bold', 'depth', 'impactful']
  },
  {
    name: 'Fascinate Inline',
    category: 'display',
    description: 'Inline western style, vintage decorative.',
    tags: ['inline', 'western', 'vintage', 'decorative', 'ornate'],
    useCases: ['vintage', 'western', 'decorative', 'ornate', 'retro']
  },
  {
    name: 'Special Elite',
    category: 'display',
    description: 'Typewriter, noir detective, newspaper style.',
    tags: ['typewriter', 'noir', 'detective', 'vintage', 'newspaper'],
    useCases: ['typewriter', 'detective', 'noir', 'newspaper', 'vintage', 'spy']
  },
  {
    name: 'Barrio',
    category: 'display',
    description: 'Festive, Mexican-inspired, celebratory.',
    tags: ['festive', 'mexican', 'celebratory', 'decorative', 'cultural'],
    useCases: ['mexican', 'fiesta', 'celebration', 'festive', 'cultural']
  },
  {
    name: 'Metal Mania',
    category: 'display',
    description: 'Heavy metal, rock music, aggressive.',
    tags: ['metal', 'rock', 'aggressive', 'edgy', 'music'],
    useCases: ['heavy metal', 'rock', 'music', 'aggressive', 'band', 'concert']
  },
  {
    name: 'Rubik Mono One',
    category: 'display',
    description: 'Geometric, bold, cube-inspired.',
    tags: ['geometric', 'bold', 'cube', 'square', 'modern'],
    useCases: ['geometric', 'modern', 'bold', 'tech', 'cubic']
  },

  // HANDWRITING FONTS
  {
    name: 'Caveat',
    category: 'fun',
    description: 'Casual handwriting, natural and personal.',
    tags: ['handwriting', 'casual', 'natural', 'personal', 'informal'],
    useCases: ['handwritten', 'casual', 'personal', 'informal', 'notes']
  },
  {
    name: 'Indie Flower',
    category: 'fun',
    description: 'Friendly handwriting, whimsical and fun.',
    tags: ['handwriting', 'friendly', 'whimsical', 'fun', 'casual'],
    useCases: ['handwritten', 'friendly', 'whimsical', 'casual', 'fun']
  },
  {
    name: 'Shadows Into Light',
    category: 'fun',
    description: 'Comic book handwriting, energetic.',
    tags: ['handwriting', 'comic', 'energetic', 'casual', 'fun'],
    useCases: ['comic', 'handwritten', 'casual', 'fun', 'energetic']
  },
  {
    name: 'Amatic SC',
    category: 'fun',
    description: 'Hand-drawn, casual, childlike charm.',
    tags: ['hand-drawn', 'casual', 'childlike', 'simple', 'charming'],
    useCases: ['hand-drawn', 'casual', 'childlike', 'simple', 'informal']
  },
  {
    name: 'Gloria Hallelujah',
    category: 'fun',
    description: 'Schoolhouse handwriting, childlike and fun.',
    tags: ['handwriting', 'childlike', 'school', 'fun', 'casual'],
    useCases: ['childlike', 'school', 'fun', 'handwritten', 'kids']
  },
  {
    name: 'Patrick Hand',
    category: 'fun',
    description: 'Comic book style handwriting.',
    tags: ['handwriting', 'comic', 'casual', 'fun', 'informal'],
    useCases: ['comic', 'handwritten', 'casual', 'informal', 'fun']
  },
  {
    name: 'Just Another Hand',
    category: 'fun',
    description: 'Tall, narrow handwriting, personal touch.',
    tags: ['handwriting', 'narrow', 'tall', 'personal', 'casual'],
    useCases: ['handwritten', 'personal', 'casual', 'narrow', 'informal']
  },
  {
    name: 'Architects Daughter',
    category: 'fun',
    description: 'Architect\'s handwriting, blueprint style.',
    tags: ['handwriting', 'architect', 'blueprint', 'technical', 'casual'],
    useCases: ['architect', 'blueprint', 'technical', 'handwritten', 'design']
  },

  // ADDITIONAL MODERN FONTS
  {
    name: 'Barlow',
    category: 'modern',
    description: 'Slightly rounded, modern sans-serif.',
    tags: ['modern', 'rounded', 'clean', 'sans-serif', 'friendly'],
    useCases: ['modern', 'clean', 'professional', 'friendly', 'versatile']
  },
  {
    name: 'Nunito',
    category: 'modern',
    description: 'Well-balanced, rounded sans-serif.',
    tags: ['rounded', 'balanced', 'modern', 'friendly', 'clean'],
    useCases: ['modern', 'friendly', 'clean', 'professional', 'approachable']
  },
  {
    name: 'Karla',
    category: 'modern',
    description: 'Grotesque sans-serif, neutral and versatile.',
    tags: ['grotesque', 'neutral', 'versatile', 'clean', 'modern'],
    useCases: ['neutral', 'versatile', 'modern', 'clean', 'professional']
  },
  {
    name: 'Quicksand',
    category: 'modern',
    description: 'Rounded, geometric, friendly and modern.',
    tags: ['rounded', 'geometric', 'friendly', 'modern', 'approachable'],
    useCases: ['friendly', 'modern', 'approachable', 'clean', 'geometric']
  },
  {
    name: 'Kanit',
    category: 'modern',
    description: 'Loopless Thai-inspired, modern and unique.',
    tags: ['modern', 'geometric', 'unique', 'clean', 'distinctive'],
    useCases: ['modern', 'unique', 'distinctive', 'tech', 'futuristic']
  },
  {
    name: 'Exo 2',
    category: 'modern',
    description: 'Futuristic, technological, geometric.',
    tags: ['futuristic', 'tech', 'geometric', 'modern', 'clean'],
    useCases: ['futuristic', 'tech', 'modern', 'sci-fi', 'technology']
  },
  {
    name: 'Titillium Web',
    category: 'modern',
    description: 'Academic project, technical and modern.',
    tags: ['modern', 'technical', 'clean', 'professional', 'academic'],
    useCases: ['modern', 'technical', 'professional', 'clean', 'academic']
  },
  {
    name: 'Jost',
    category: 'modern',
    description: 'Geometric sans-serif, based on Futura.',
    tags: ['geometric', 'modern', 'clean', 'futura', 'classic-modern'],
    useCases: ['modern', 'geometric', 'clean', 'professional', 'versatile']
  },
  {
    name: 'Hind',
    category: 'modern',
    description: 'Screen-optimized, clean and legible.',
    tags: ['screen', 'clean', 'legible', 'modern', 'optimized'],
    useCases: ['screen', 'digital', 'modern', 'clean', 'UI']
  },
  {
    name: 'Mukta',
    category: 'modern',
    description: 'Minimalist, modern, highly legible.',
    tags: ['minimalist', 'modern', 'legible', 'clean', 'simple'],
    useCases: ['minimalist', 'modern', 'clean', 'simple', 'professional']
  },

  // VINTAGE/RETRO FONTS
  {
    name: 'Righteous',
    category: 'fun',
    description: 'Retro 80s, synthwave aesthetic.',
    tags: ['retro', '80s', 'synthwave', 'neon', 'geometric'],
    useCases: ['80s', 'retro', 'synthwave', 'neon', 'arcade', 'video game']
  },
  {
    name: 'Bungee Inline',
    category: 'display',
    description: 'Inline vertical font, urban signage.',
    tags: ['inline', 'urban', 'signage', 'geometric', 'retro'],
    useCases: ['urban', 'signage', 'retro', 'street', 'inline']
  },
  {
    name: 'Yellowtail',
    category: 'elegant',
    description: 'Vintage script, 1930s advertising.',
    tags: ['script', 'vintage', '30s', 'retro', 'advertising'],
    useCases: ['vintage', '30s', 'retro', 'advertising', 'classic']
  },
  {
    name: 'Poiret One',
    category: 'elegant',
    description: 'Art deco, 1920s geometric elegance.',
    tags: ['art-deco', '20s', 'geometric', 'elegant', 'vintage'],
    useCases: ['art deco', '20s', 'vintage', 'elegant', 'gatsby']
  },
  {
    name: 'Cinzel Decorative',
    category: 'classic',
    description: 'Ornate Roman capitals, classical decorative.',
    tags: ['roman', 'ornate', 'classical', 'decorative', 'elegant'],
    useCases: ['classical', 'roman', 'elegant', 'ornate', 'historical']
  },
  {
    name: 'Codystar',
    category: 'display',
    description: 'Starry, sparkly, celebratory.',
    tags: ['stars', 'sparkle', 'celebration', 'decorative', 'festive'],
    useCases: ['celebration', 'festive', 'sparkly', 'stars', 'party']
  },
  {
    name: 'Megrim',
    category: 'display',
    description: 'Wireframe, architectural, technical drawing.',
    tags: ['wireframe', 'architectural', 'technical', 'lines', 'geometric'],
    useCases: ['wireframe', 'architectural', 'technical', 'blueprint', 'design']
  },

  // ADDITIONAL SPECIALTY FONTS
  {
    name: 'UnifrakturMaguntia',
    category: 'classic',
    description: 'Gothic blackletter, medieval manuscript style.',
    tags: ['gothic', 'blackletter', 'medieval', 'old-english', 'traditional'],
    useCases: ['medieval', 'gothic', 'old english', 'fantasy', 'historical', 'certificate']
  },
  {
    name: 'Philosopher',
    category: 'modern',
    description: 'Geometric with character, philosophical aesthetic.',
    tags: ['geometric', 'unique', 'modern', 'philosophical', 'distinctive'],
    useCases: ['philosophical', 'unique', 'modern', 'distinctive', 'thoughtful']
  },
  {
    name: 'Abril Fatface',
    category: 'display',
    description: 'Fashion magazine editorial style.',
    tags: ['display', 'fashion', 'editorial', 'dramatic', 'bold'],
    useCases: ['fashion', 'magazine', 'editorial', 'dramatic', 'luxury']
  },
  {
    name: 'Tinos',
    category: 'classic',
    description: 'Times New Roman alternative, traditional serif.',
    tags: ['serif', 'traditional', 'classic', 'timeless', 'formal'],
    useCases: ['traditional', 'formal', 'document', 'academic', 'professional']
  },
  {
    name: 'Zilla Slab',
    category: 'modern',
    description: 'Contemporary slab serif, Mozilla font.',
    tags: ['slab', 'contemporary', 'modern', 'tech', 'bold'],
    useCases: ['modern', 'contemporary', 'tech', 'professional', 'bold']
  },
  {
    name: 'Archivo',
    category: 'modern',
    description: 'Grotesque sans-serif, optimized for screens.',
    tags: ['grotesque', 'modern', 'screen', 'clean', 'versatile'],
    useCases: ['modern', 'screen', 'clean', 'professional', 'versatile']
  },
];

// Helper function to search fonts by tags or use cases
export function findFontsByStyle(searchTerms: string[]): FontMetadata[] {
  const lowerTerms = searchTerms.map(t => t.toLowerCase());
  
  return FONT_METADATA.filter(font => {
    const searchableText = [
      font.name.toLowerCase(),
      font.description.toLowerCase(),
      ...font.tags.map(t => t.toLowerCase()),
      ...font.useCases.map(u => u.toLowerCase())
    ].join(' ');
    
    return lowerTerms.some(term => searchableText.includes(term));
  });
}

// Get all font names for validation
export const ALL_FONT_NAMES = FONT_METADATA.map(f => f.name);

// Get fonts by category
export function getFontsByCategory(category: string): FontMetadata[] {
  return FONT_METADATA.filter(f => f.category === category);
}

// Export organized by category for backwards compatibility
export const FONT_CATEGORIES = {
  display: FONT_METADATA.filter(f => f.category === 'display').map(f => f.name),
  modern: FONT_METADATA.filter(f => f.category === 'modern').map(f => f.name),
  classic: FONT_METADATA.filter(f => f.category === 'classic').map(f => f.name),
  fun: FONT_METADATA.filter(f => f.category === 'fun').map(f => f.name),
  elegant: FONT_METADATA.filter(f => f.category === 'elegant').map(f => f.name),
  tech: FONT_METADATA.filter(f => f.category === 'tech').map(f => f.name),
};

