// Ported from the Claude artifact tool — this is the same tested parsing/generation
// logic, just exported as a module instead of living inside an IIFE.

const BASE_CHARACTERS = ["Accountable Ant","Adaptable Alien","Adventurous Astronaut","Alert Ape","Ambitious Angel","Amiable Anchovy","Amped Aye Aye","Arbitraging Admiral","Articulate Armadillo","Aspiring Alpaca","Authentic Anaconda","Awesome African Civet","Bad Intentions","Bad-Ass Bulldog","Balanced Beetle","Bashful Blobfish","Be The Bigger Person","Befuddled Burglar","Big Game Bandicoot","Boisterous Beaver","Bombastic Baboon","Boss Bobcat","Brave Bison","Brilliant Barb","Bubbly Buzzard","Bullish Bull","Calm Clam","Candid Clownfish","Capable Caterpillar","Caring Camel","Charming Cheetah","Cheerful Chipmunk","Chill Chinchilla","Clever Crocodile","Common Sense Cow","Compassionate Catfish","Competitive Clown","Confident Cobra","Considerate Cowboy","Consistent Cougar","Content Condor","Conviction Cockroach","Courageous Cockatoo","Creative Crab","Curious Crane","Cynical Cat","Dapper Dachshund","Decisive Duck","Dedicated Dragonfly","Determined Dolphin","Dialed In Dog","Dope Dodo","Driven Dragon","Dynamic Dinosaur","Eager Eagle","Empathy Elephant","Entrepreneur Elf","Fly Firefly","Genuine Giraffe","Gift Goat","Gratitude Gorilla","Headstrong Honey Badger","Heart Trooper","Patient Panda","Perceptive Puma","Practical Peacock","Tremendous Tiger","Willful Wizard","Zero Cool"];

const MANGA_CHARACTERS = ["Adventurous Astronaut","Ambitious Angel","Amped Aye Aye","Articulate Armadillo","Aspiring Alpaca","Bashful Blobfish","Benevolent Barn Owl","Big Game Bandicoot","Boisterous Beaver","Bullish Bull","Chill Chinchilla","Compassionate Catfish","Competitive Clown","Considerate Cowboy","Consistent Cougar","Decisive Duck","Determined Dolphin","Dialed In Dog","Driven Dragon","Eager Eagle","Entrepreneur Elf","Fearless Fairy","Flex'n Fox","Fly Firefly","Focused Falcon","Forever Phoenix","Gifted Gopher","Genuine Giraffe","Gracious Grizzly Bear","Happy Hermit Crab","Headstrong Honey Badger","Heart Trooper","Helpful Hippo","Hype Horse","Hungry Hammerhead","Hustling Hamster","Innovative Impala","Kind Warrior","Kindred Kangaroo","Likable Leopard","Logical Lion","Notorious Ninja","OG Ox","Patient Pig","Positive Porcupine","Protective Panther","Rare Robot","Resilient Red Devil","Tenacious Turkey","Tranquil Toad","Tremendous Tiger","Versatile Viking","Warm Wolverine","Willful Wizard"];

const SPECTACULAR_CHARACTERS = ["Adaptable Alien","Adventurous Astronaut","Alpha Alligator","Ambitious Angel","Amped Aye Aye","Arbitraging Admiral","Articulate Armadillo","Aspiring Alpaca","Bad Intentions","Bashful Blobfish","Benevolent Barn Owl","Big Game Bandicoot","Boisterous Beaver","Bold As Heck Bat","Brave Bison","Bullish Bull","Chill Chinchilla","Compassionate Catfish","Competitive Clown","Considerate Cowboy","Consistent Cougar","Conviction Cockroach","Courageous Cockatoo","Curious Crane","Cynical Cat","Daring Dragonfly","Decisive Duck","Determined Dolphin","Dialed In Dog","Driven Dragon","Eager Eagle","Empathy Elephant","Entrepreneur Elf","Fearless Fairy","Flex'n Fox","Fly Firefly","Focused Falcon","Forever Phoenix","Forthright Flamingo","Gary Bee","GaryVee","Genuine Giraffe","Gifted Gopher","Gracious Grizzly Bear","Gritty Ghost","Happy Hermit Crab","Hard-Working Wombat","Headstrong Honey Badger","Heart Trooper","Helpful Hippo","Hot Shot Hornet","Hungry Hammerhead","Hustling Hamster","Hype Horse","Innovative Impala","Insightful Irish Terrier","Jolly Jack-O","Juicy Jaguar","Kind Warrior","Kindred Kangaroo","Knowing Gnome","Likable Leopard","Logical Lion","Mint Mink","Motivated Monster","Nifty Narwhal","Noble Numbat","Notorious Ninja","OG Ox","Passionate Parrot","Patient Pig","Perfect Persian Cat","Persistent Penguin","Perspective Pigeon","Poised Pug","Positive Porcupine","Protective Panther","Rare Robot","Resilient Red Devil","Respectful Racoon","Sensible Sommelier","Shrewd Shark","Skilled Skeleton","Smooth Spider","Tenacious Turkey","Thoughtful Three Horned Harpik","Tidy Troll","Tolerant Tuna","Tranquil Toad","Tremendous Tiger","Trusting Tarantula","Turnt Tick","Versatile Viking","Very Very Very Very Lucky Black Cat","Vibe'n Vampire","Warm Wolverine","Well-Connected Werewolf","Willful Wizard","Witty Weasel","Zealous Zombie"];

const TC_CHARACTERS = ["Alert Ape","Balanced Beetle","Be The Bigger Person","Brilliant Barracuda","Confident Cobra","Creative Crab","Diamond Hands Hen","Dynamic Dinosaur","Gratitude Gorilla","Intuitive Iguana","Legendary Lemur","Moral Monkey","Observant Oyster","Optimistic Otter","Patient Panda","Peaceful Pelican","Practical Peacock","Proactive Piranha","Swaggy Sea Lion","Sweet Swan","To The Moon Meerkat"];

const CHROME2026_CHARACTERS = ["Adaptable Alien","Adventurous Astronaut","Bad Intentions","Bashful Blobfish","Competitive Clown","Confident Cobra","Driven Dragon","Empathy Elephant","Fearless Fairy","Gary Bee","Gratitude Gorilla","Jolly Jack-O","Motivated Monster","Rare Robot","Resilient Red Devil","Thoughtful Three Horned Harpik","Tidy Troll","Versatile Viking","Very Very Very Very Lucky Black Cat","Willful Wizard","Accountable Ant","Amiable Anchovy","Arbitraging Admiral","Aspiring Alpaca","Awesome African Civet","Be The Bigger Person","Befuddled Burglar","Big Game Bandicoot","Bombastic Baboon","Boss Bobcat","Brave Bison","Brilliant Barb","Bubbly Buzzard","Calm Clam","Candid Clownfish","Caring Camel","Cheerful Chipmunk","Clever Crocodile","Compassionate Catfish","Conviction Cockroach","Courageous Cockatoo","Curious Crane","Dedicated Dragonfly","Detail-Oriented Dumbo Octopus","Determined Dolphin","Earnest Ermine","Faithful Pheasant","Flex'n Fox","Forever Phoenix","Gentle Giant","Genuine Giraffe","Gleeful Sugar Glider","Gracious Grasshopper","Grateful Gar","Gritty Ghost","Happy Hermit Crab","Hard-Working Wombat","Helpful Hippo","Honorable Olm","Hot Shot Hornet","Humble Hummingbird","Hungry Hammerhead","Hype Horse","Independent Inch Worm","Intuitive Iguana","Just Jackal","Keen Kingfisher","Kind Warrior","Kindred Kangaroo","Knowing Gnome","Likable Leopard","Lit Lamb","Loyal Lobster","Macho Manta Ray","Magnanimous Maltese","Meticulous Magpie","Mint Mink","Modest Moose","Mojo Mouse","Observant Oyster","Organized Ostrich","Passionate Parrot","Persistent Penguin","Perspective Pigeon","Polished Poodle","Positive Porcupine","Practical Peacock","Profound Possum","Reliable Rat","Respectful Racoon","Responsive Ram","Self-Aware Hare","Sentimental Salamander","Serious Sperm Whale","Sharing Squirrel","Sincere Skunk","Spiffy Salmon","Steadfast Snake","Stoic Slime","Swaggy Sea Lion","Tasteful Malayan Tapir","Tolerant Tuna","Truculent T-Rex","Turnt Tick","Well-Connected Werewolf","Wily Wild Boar","Woke Walrus","Yolo Yak","Zealous Zombie","Articulate Armadillo","Boisterous Beaver","Bullish Bull","Charming Cheetah","Common Sense Cow","Creative Crab","Cynical Cat","Dialed In Dog","Dope Dodo","Enamoured Emu","Entrepreneur Elf","Gracious Goose","Moral Monkey","Outgoing Octopus","Patient Pig","Productive Puffin","Skilled Skeleton","Ambitious Angel","Dynamic Dinosaur","Heart Trooper","Hustling Hamster","Notorious Ninja","Optimistic Otter","Sensitive Centipede","Chill Chinchilla","Decisive Duck","Glowing Glow Worm","Humble Hedgehog","Joyous Jellyfish","Mindful Minokawa","Perfect Persian Cat","Stunned Sun","Tranquil Toad","Vibe'n Vampire","Whimsical Wolf","Alert Ape","Content Condor","Headstrong Honey Badger","Impeccable Inostranet","Legendary Lemur","Persuasive Pigeon","Prudent Polar Bear","Tenacious Termite","To The Moon Meerkat","Logical Lion","Amped Aye Aye","Authentic Anaconda","Bad-Ass Bulldog","Considerate Cowboy","Consistent Cougar","Eager Eagle","Focused Falcon","Forgiving Horned Frog","Gifted Gopher","Gracious Grizzly Bear","Noble Numbat","Offense Oriented Orangutan","Protective Panther","Radical Rabbit","Tenacious Turkey","Tremendous Tiger","Warm Wolverine","Zestful Zebra","Secure Sparrow","Sensible Sommelier","Shrewd Sheep","Spontaneous Seahorse","Tolerant Tortoise","Trusting Tarantula","Unwavering Urchin","Well-Rounded Warthog"];

const ALL_CHARACTERS = [...new Set([...BASE_CHARACTERS, ...MANGA_CHARACTERS, ...SPECTACULAR_CHARACTERS, ...TC_CHARACTERS, ...CHROME2026_CHARACTERS])];

const SETS = {
  // ---- Trading cards ----
  series1: { category:"cards", label:"VeeFriends Series 1", shortLabel:"Series 1", year:"2022", rarities:[
    {name:"Base", run:"22 copies", color:"#9a9a9a"},
    {name:"Gold", run:"1/1", color:"#c9a227"},
    {name:"Diamond", run:"1/1", color:"#a9d8ef"},
    {name:"Hologram", run:"1/1", color:"#b79bf0"},
    {name:"Bubble Gum", run:"1/1", color:"#ef9fc9"},
    {name:"Lava", run:"1/1", color:"#e2582a"},
    {name:"Autograph", run:"1/1", color:"#1c1b22"},
    {name:"Access Token (Gunmetal)", run:"1/1", color:"#5c6270"},
  ]},
  compete: { category:"cards", label:"VeeFriends Compete & Collect (Series 2 TCG)", shortLabel:"Compete & Collect", year:"2022", rarities:[
    {name:"Core", run:"tiered", color:"#e6b724"},
    {name:"Rare", run:"/500", color:"#8a5a2e"},
    {name:"Very Rare", run:"/100", color:"#d97730"},
    {name:"Epic", run:"/25", color:"#3f8f45"},
    {name:"Spectacular Gold", run:"1/1", color:"#c9a227"},
    {name:"Spectacular Lava", run:"1/1", color:"#e2582a"},
    {name:"Spectacular Diamond", run:"1/1", color:"#a9d8ef"},
    {name:"Spectacular Hologram", run:"1/1", color:"#b79bf0"},
    {name:"Spectacular Bubble Gum", run:"1/1", color:"#ef9fc9"},
    {name:"Spectacular Emerald", run:"1/1", color:"#2e8b57"},
    {name:"GaryVee Autograph", run:"1/1", color:"#1c1b22"},
    {name:"Original Art Insert", run:"/5", color:"#2e8b57"},
    {name:"Gift Goat", run:"/555", color:"#b07dd6"},
  ]},
  chrome2025: { category:"cards", label:"Topps VeeFriends Chrome 2025", shortLabel:"Topps Chrome '25", year:"2025", rarities:[
    {name:"Base Chrome", run:"base", color:"#9a9a9a"},
    {name:"Sketch to Screen", run:"2 per box", color:"#c9c4b8"},
    {name:"Topps 1975", run:"1:339 packs", color:"#d9822b"},
    {name:"Y2K", run:"1:735 packs", color:"#59c2d8"},
    {name:"Game On!", run:"1:1,200 packs", color:"#2fb6b0"},
    {name:"Iconics", run:"1:1,300 packs", color:"#a13fc4"},
    {name:"ERUPT!", run:"1:3,000 packs", color:"#e83e2b"},
    {name:"ERUPT! Black Lava", run:"/10", color:"#1c1b22"},
    {name:"ERUPT! Superfractor", run:"1/1", color:"#c9a227"},
  ]},
  chrome2026: { category:"cards", label:"Topps VeeFriends Chrome 2026", shortLabel:"Topps Chrome '26", year:"2026", rarities:[
    {name:"Base Chrome", run:"base", color:"#9a9a9a"},
    {name:"First Chrome", run:"149 chars", color:"#3fb56a"},
    {name:"ERUPT!", run:"20 chars", color:"#e83e2b"},
    {name:"Content Condor's Favorite Content Creators", run:"insert", color:"#0074d9"},
    {name:"Content Condor's Favorite Content Creators Auto", run:"auto", color:"#0074d9"},
    {name:"Comic Clippings", run:"1/1", color:"#1c1b22"},
    {name:"Manga Speckle", run:"100 chars", color:"#a13fc4"},
    {name:"Chalkboard", run:"20 chars", color:"#3a3a3a"},
    {name:"MegaHeads", run:"Mega Box excl.", color:"#e0722c"},
    {name:"Neon Lights", run:"20 chars", color:"#39cccc"},
    {name:"Stellar Haze", run:"20 chars", color:"#7a3ea1"},
    {name:"Balance Battles", run:"10 dual cards", color:"#2fb6b0"},
    {name:"1986 Football", run:"25 chars", color:"#8a5a2e"},
    {name:"Iconics", run:"20 chars, lava", color:"#e2582a"},
    {name:"Original Sketch Selections", run:"5 chars, 1/1", color:"#c9c4b8"},
    {name:"Sketch Cards", run:"1/1", color:"#1c1b22"},
  ]},

  // ---- Stickers ----
  manga: { category:"stickers", label:"VeeFriends Super Stickers: Manga Series", shortLabel:"Manga Stickers", year:"2025", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Curry Crossover", run:"insert", color:"#e0722c"},
    {name:"Numbered Parallel", run:"numbered", color:"#5b9bd5"},
    {name:"Black & White", run:"short print", color:"#3a3a3a"},
    {name:"Kind Warrior / GaryVee 1/1", run:"1/1", color:"#c9a227"},
  ]},
  spectacular: { category:"stickers", label:"VeeFriends Super Stickers: Spectacular Series", shortLabel:"Spectacular Stickers", year:"2026", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Diamond", run:"1/1", color:"#a9d8ef"},
    {name:"Gold", run:"1/1", color:"#c9a227"},
    {name:"Lava", run:"1/1", color:"#e2582a"},
    {name:"Bubble Gum", run:"1/1", color:"#ef9fc9"},
    {name:"Emerald", run:"1/1", color:"#2e8b57"},
    {name:"Hologram", run:"1/1", color:"#b79bf0"},
    {name:"Autograph", run:"1/1", color:"#1c1b22"},
    {name:"Numbered Parallel", run:"/55", color:"#5b9bd5"},
    {name:"Debut", run:"12 characters", color:"#3fb56a"},
    {name:"Spectacular Showdown", run:"insert", color:"#d9822b"},
    {name:"5 Year OG Art", run:"case hit", color:"#7a5c3e"},
    {name:"5 Year OG Art Autograph", run:"/5", color:"#7a5c3e"},
    {name:"Diamond Die Cut", run:"case hit", color:"#a9d8ef"},
    {name:"Sixth Dimension", run:"insert", color:"#5b9bd5"},
    {name:"Sixth Dimension Black", run:"/99", color:"#1c1b22"},
    {name:"Mini Sticker", run:"insert", color:"#b07dd6"},
    {name:"White Ice Parallel", run:"hanger pack", color:"#dfeaf0"},
  ]},
  roadtoveeconSticker: { category:"stickers", label:"VeeFriends Road to VeeCon 2024 Super Sticker", shortLabel:"Road to VeeCon Sticker", year:"2024", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Shimmer", run:"numbered", color:"#a9d8ef"},
    {name:"Cosmic", run:"numbered", color:"#7a3ea1"},
    {name:"Gold", run:"numbered", color:"#c9a227"},
    {name:"Ghost", run:"numbered", color:"#e6e8ee"},
  ]},
  halloween2023Sticker: { category:"stickers", label:"VeeFriends 2023 Halloween Mystery Super Sticker", shortLabel:"Halloween '23 Sticker", year:"2023", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Spooktacular", run:"chase", color:"#e0722c"},
  ]},
  tenaciousTurkey: { category:"stickers", label:"Tenacious Turkey Super Sticker Collection", shortLabel:"Tenacious Turkey Sticker", year:"", rarities:[
    {name:"Base", run:"1 of 7 variants", color:"#9a9a9a"},
    {name:"Pumpkin Pie", run:"", color:"#d9822b"},
    {name:"Cranberry", run:"", color:"#a12020"},
    {name:"Gravy", run:"", color:"#7a5c3e"},
  ]},

  // ---- Pins (release years marked "" where not confirmed) ----
  edition0: { category:"pins", label:"VeeFriends Pins: Edition 0", shortLabel:"Edition 0 Pin", year:"2023", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Numbered", run:"numbered", color:"#5b9bd5"},
    {name:"Scenic Pin Pal (Patient Pig)", run:"", color:"#3fb56a"},
    {name:"1/1", run:"1/1", color:"#c9a227"},
  ]},
  halloween2023: { category:"pins", label:"VeeFriends 2023 Halloween Mystery Pins", shortLabel:"Halloween '23 Pin", year:"2023", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Spooktacular", run:"chase", color:"#e0722c"},
    {name:"Gemstone Black Cat", run:"1 of 40 ever", color:"#7a3ea1"},
  ]},
  roadtoveecon: { category:"pins", label:"VeeFriends Road to VeeCon 2024 Mystery Pin", shortLabel:"Road to VeeCon Pin", year:"2024", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Shimmer", run:"numbered", color:"#a9d8ef"},
    {name:"Cosmic", run:"numbered", color:"#7a3ea1"},
    {name:"Gold", run:"numbered", color:"#c9a227"},
    {name:"Ghost", run:"numbered", color:"#e6e8ee"},
    {name:"Meteorite (Adventurous Astronaut)", run:"ultra rare", color:"#1c1b22"},
  ]},
  nynu: { category:"pins", label:"VeeFriends New Year New You Mystery Collection", shortLabel:"New Year New You Pin", year:"2025", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Gold", run:"numbered", color:"#c9a227"},
    {name:"Cosmic", run:"numbered", color:"#7a3ea1"},
    {name:"Ghost", run:"numbered", color:"#e6e8ee"},
    {name:"Iridescent (VF logo + Lucky Black Cat)", run:"special", color:"#b79bf0"},
  ]},
  nycc: { category:"pins", label:"VeeFriends Pins: New York Comic Con", shortLabel:"NYCC Pin", year:"", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Glow-in-the-Dark", run:"event exclusive", color:"#3fb56a"},
    {name:"Numbered", run:"numbered", color:"#5b9bd5"},
    {name:"1/1", run:"1/1", color:"#c9a227"},
  ]},
  giftGoatPin: { category:"pins", label:"Gift Goat Surprise & Delight Pin", shortLabel:"Gift Goat Pin", year:"", rarities:[
    {name:"Gift Goat Pin", run:"/555", color:"#e6e8ee"},
  ]},


  // ---- Coins ----
  coins2026: { category:"coins", label:"2026 VeeFriends Collectible Coins", shortLabel:"Coins '26", year:"2026", rarities:[
    {name:"Classic – Silver Plated", run:"base", color:"#c7c9d1"},
    {name:"Classic – Gold Plated", run:"base", color:"#c9a227"},
    {name:"Classic – Black Gold Plated", run:"base", color:"#3a3020"},
    {name:"Comic – Silver Plated", run:"base", color:"#c7c9d1"},
    {name:"Comic – Gold Plated", run:"base", color:"#c9a227"},
    {name:"Comic – Black Gold Plated", run:"base", color:"#3a3020"},
    {name:"OG – Silver Plated", run:"base", color:"#c7c9d1"},
    {name:"OG – Gold Plated", run:"base", color:"#c9a227"},
    {name:"OG – Black Gold Plated", run:"base", color:"#3a3020"},
    {name:"Pure .999 Silver", run:"rare pull", color:"#e6e8ee"},
    {name:"Pure .999 24K Gold", run:"rare pull", color:"#e0b83a"},
    {name:"Battle Coin", run:"insert", color:"#c0392b"},
  ]},
  tcCoin2025: { category:"coins", label:"VeeFriends Treasure Chest Graded Coin (2025)", shortLabel:"TC Coin '25", year:"2025", rarities:[
    {name:"NGC Graded", run:"base", color:"#c7c9d1"},
    {name:"1oz Pure Gold Chase", run:"chase", color:"#e0b83a"},
  ]},

  // ---- Treasure Chest (2025) ----
  tcGemstonePin: { category:"treasurechest", label:"VeeFriends Treasure Chest — Gemstone Pin", shortLabel:"TC Gemstone Pin", year:"2025", rarities:[
    {name:"Gemstone Pin", run:"ltd. ≤99 made", color:"#7a3ea1"},
  ]},
  tcGradedCoin: { category:"treasurechest", label:"VeeFriends Treasure Chest — Graded Coin", shortLabel:"TC Graded Coin", year:"2025", rarities:[
    {name:"NGC Graded", run:"base", color:"#c7c9d1"},
    {name:"1oz Pure Gold Chase", run:"chase", color:"#e0b83a"},
  ]},
  tcSuperSticker: { category:"treasurechest", label:"VeeFriends Treasure Chest — Debut Super Sticker", shortLabel:"TC Super Sticker", year:"2025", rarities:[
    {name:"Debut Sapphire", run:"", color:"#2f6fa8"},
  ]},
  tcClassicPin: { category:"treasurechest", label:"VeeFriends Treasure Chest — Classic Pin", shortLabel:"TC Classic Pin", year:"2025", rarities:[
    {name:"Base", run:"base", color:"#9a9a9a"},
    {name:"Numbered", run:"numbered", color:"#5b9bd5"},
    {name:"1/1", run:"1/1", color:"#c9a227"},
  ]},
};

const CATEGORY_META = {
  cards:         { label:"Cards",          itemLabel:"Trading Card",       sets:["chrome2026","chrome2025","compete","series1"] },
  stickers:      { label:"Stickers",       itemLabel:"Sticker",            sets:["spectacular","manga","roadtoveeconSticker","halloween2023Sticker","tenaciousTurkey"] },
  pins:          { label:"Pins",           itemLabel:"Pin",                sets:["edition0","halloween2023","roadtoveecon","nynu","nycc","giftGoatPin"] },
  coins:         { label:"Coins",          itemLabel:"Coin",               sets:["coins2026","tcCoin2025"] },
  treasurechest: { label:"Treasure Chest", itemLabel:"Treasure Chest Item",sets:["tcGemstonePin","tcGradedCoin","tcSuperSticker","tcClassicPin"] },
};
const CATEGORY_ORDER = ["cards","stickers","pins","coins","treasurechest"];

const SETS_BY_YEAR = {};
Object.keys(SETS).forEach(id=>{
  const yr = SETS[id].year;
  if(yr){ (SETS_BY_YEAR[yr] = SETS_BY_YEAR[yr] || []).push(id); }
});

const GRADE_CYCLE = ["Raw","PSA 10","PSA 9","PSA 8","BGS 9.5","BGS 9","SGC 10","SGC 9","CGC 10","CGC 9","NGC 70","NGC 69"];
const TRIVIAL_RUNS = new Set(["base","tiered",""]);
const STOPWORDS = ["veefriends","vf","card","cards","the","a","an","of","sticker","stickers","pin","pins","coin","coins","chrome","tcg"];
// sets whose only keyword trigger is identical to a character name (e.g. "Gift Goat", "Tenacious Turkey") —
// these should only resolve once a category word (sticker/pin/etc.) has already scoped the search,
// otherwise they'd hijack any query that merely mentions that character
const AMBIGUOUS_SETS = new Set(["giftGoatPin","tenaciousTurkey","coins2026","tcCoin2025"]);

// ---------- parsing ----------
function detectGrade(text){
  const m = text.match(/\b(psa|bgs|sgc|cgc|hga|ngc)\s*-?\s*(\d{1,2}(?:\.5)?)\b/i);
  if(m) return (m[1].toUpperCase() + " " + m[2]);
  if(/\b(raw|ungraded)\b/i.test(text)) return "Raw";
  return null;
}
function detectCategory(text){
  const t = text;
  const tests = [
    [/\btreasure\s*chest\b|\btc\b/i, "treasurechest"],
    [/\bsticker(s)?\b|\bmanga\b|\bspectacular\b|\bspec\b/i, "stickers"],
    [/\bpin(s)?\b/i, "pins"],
    [/\bcoin(s)?\b/i, "coins"],
    [/\bchrome\b|\btcg\b|\bseries\s*[12]\b|\bcompete\b|\bzerocool\b|\bcard(s)?\b/i, "cards"],
  ];
  for(const [re,id] of tests){ if(re.test(t)) return {categoryId:id, re}; }
  return {categoryId:null, re:null};
}
function detectSet(text, categoryId){
  const t = text;
  const candidates = categoryId ? CATEGORY_META[categoryId].sets : Object.keys(SETS).filter(id=>!AMBIGUOUS_SETS.has(id));
  const keywordMap = {
    series1: /\bseries\s*1\b|\bs1\b|\bzerocool\b/i,
    compete: /\bcompete\b|\bcollect\b|\btcg\b|\bseries\s*2\b|\bs2\b/i,
    chrome2025: /\bchrome\s*2025\b|\b2025\s*chrome\b/i,
    chrome2026: /\bchrome\s*2026\b|\b2026\s*chrome\b/i,
    manga: /\bmanga\b/i,
    spectacular: /\bspectacular\b|\bspec\b/i,
    edition0: /\bedition\s*0\b|\bed\.?\s*0\b/i,
    halloween2023: /\bhalloween\b/i,
    roadtoveecon: /\broad\s*to\s*veecon\b|\bveecon\b/i,
    nynu: /\bnew\s*year\s*new\s*you\b|\bnynu\b/i,
    nycc: /\bnew\s*york\s*comic\s*con\b|\bnycc\b|\bcomic\s*con\b/i,
    coins2026: /\b2026\b/i,
    tcCoin2025: /\btreasure\s*chest\b|\btc\b|\b2025\b/i,
    tcGemstonePin: /\bgemstone\b/i,
    tcGradedCoin: /\bcoin\b/i,
    tcSuperSticker: /\bsticker\b/i,
    tcClassicPin: /\bpin\b/i,
    roadtoveeconSticker: /\broad\s*to\s*veecon\b|\bveecon\b/i,
    halloween2023Sticker: /\bhalloween\b/i,
    tenaciousTurkey: /\btenacious\s*turkey\b/i,
    giftGoatPin: /\bgift\s*goat\b/i,
  };
  for(const id of candidates){
    const re = keywordMap[id];
    if(re && re.test(t)) return {setId:id, re};
  }
  return null;
}
function detectRarity(text, setId, categoryId){
  const t = text.toLowerCase();
  const pool = setId ? [setId] : (categoryId ? CATEGORY_META[categoryId].sets : Object.keys(SETS));
  const all = [];
  pool.forEach(sid=> SETS[sid].rarities.forEach(r=> all.push({sid, r})));
  all.sort((a,b)=> b.r.name.replace(/\s*\([^)]*\)/g,'').replace(/[!?.,]+$/,'').length - a.r.name.replace(/\s*\([^)]*\)/g,'').replace(/[!?.,]+$/,'').length);
  for(const {sid, r} of all){
    const matchName = r.name.replace(/\s*\([^)]*\)/g,'').replace(/[!?.,]+$/,'').trim();
    const re = new RegExp("\\b"+matchName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"\\b","i");
    if(re.test(t)) return {setId:sid, rarityName:r.name, re};
  }
  // fallback: score rarities by how many distinctive words they share with the query
  // (handles compound names like coin rarities, e.g. "gold" -> "Classic – Gold Plated")
  const queryWords = t.split(/\s+/).filter(w=>w.length>=3 && !STOPWORDS.includes(w));
  let best=null, bestScore=0, bestLen=Infinity, bestWords=null;
  all.forEach(({sid,r})=>{
    const matchName = r.name.replace(/\s*\([^)]*\)/g,'').trim();
    const nameWords = matchName.toLowerCase().split(/[\s–-]+/).filter(w=>w.length>=3);
    const overlap = nameWords.filter(nw=>queryWords.includes(nw));
    const score = overlap.length;
    if(score>0 && (score>bestScore || (score===bestScore && nameWords.length<bestLen))){
      best = {sid,r}; bestScore=score; bestLen=nameWords.length; bestWords=overlap;
    }
  });
  if(best){
    const re = new RegExp("\\b("+bestWords.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join("|")+")\\b","i");
    return {setId:best.sid, rarityName:best.r.name, re};
  }
  return null;
}
function scoreCharacter(name, queryWords){
  const nameLower = name.toLowerCase();
  const nameWords = nameLower.split(/\s+/);
  let score = 0;
  queryWords.forEach(qw=>{
    if(!qw) return;
    if(nameLower.includes(qw)) score += qw.length;
    nameWords.forEach(nw=>{
      if(nw===qw) score += 6;
      else if(nw.startsWith(qw)) score += 2;
    });
  });
  return score;
}
function detectCharacter(remainingText){
  const words = remainingText.toLowerCase().split(/\s+/).filter(w=>w && !STOPWORDS.includes(w));
  if(words.length===0) return {character:null, isCustom:false};
  let best=null, bestScore=0;
  ALL_CHARACTERS.forEach(name=>{
    const s = scoreCharacter(name, words);
    if(s>bestScore){ bestScore=s; best=name; }
  });
  if(best && bestScore>=3) return {character:best, isCustom:false};
  const custom = words.map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  return {character:custom, isCustom:true};
}
function parseQuery(raw){
  const grade = detectGrade(raw);
  let text = raw;
  if(grade && grade!=="Raw"){
    const [company, num] = grade.split(' ');
    const re = new RegExp("\\b"+company+"\\s*-?\\s*"+num.replace('.','\\.')+"\\b","ig");
    text = text.replace(re, " ");
  }
  text = text.replace(/\b(raw|ungraded)\b/ig," ");

  const catResult = detectCategory(text);
  let categoryId = catResult.categoryId;

  let setId = null;
  const setResult = detectSet(text, categoryId);
  if(setResult){
    setId = setResult.setId;
    if(!categoryId) categoryId = SETS[setId].category;
    if(setId!=="giftGoatPin" && setId!=="tenaciousTurkey") text = text.replace(setResult.re, " ");
  }

  const rarityResult = detectRarity(text, setId, categoryId);
  let rarityName = null;
  if(rarityResult){
    rarityName = rarityResult.rarityName;
    if(!setId) setId = rarityResult.setId;
    if(!categoryId) categoryId = SETS[setId].category;
    text = text.replace(rarityResult.re, " ");
  }

  if(!setId){
    const yearMatch = text.match(/\b20[2-3][0-9]\b/);
    if(yearMatch){
      let yearCandidates = SETS_BY_YEAR[yearMatch[0]] || [];
      if(categoryId) yearCandidates = yearCandidates.filter(id=>SETS[id].category===categoryId);
      if(yearCandidates.length>0){
        setId = yearCandidates[0];
        if(!categoryId) categoryId = SETS[setId].category;
        text = text.replace(yearMatch[0], " ");
      }
    }
  }

  if(!categoryId) categoryId = "cards";
  if(!setId) setId = CATEGORY_META[categoryId].sets[0];

  text = text.replace(/\b20[2-3][0-9]\b/g, " ");
  let {character, isCustom} = detectCharacter(text);
  if(!character && setId==="giftGoatPin"){ character = "Gift Goat"; isCustom = false; }
  return {character, isCustom, categoryId, setId, rarityName, grade};
}

// ---------- state ----------
const DEFAULT_OVERRIDES = { categoryId:null, setId:null, rarityName:null, grade:null };

function effectiveState(parsed, overrides){
  overrides = overrides || DEFAULT_OVERRIDES;
  const categoryId = overrides.categoryId || parsed.categoryId || "cards";
  const catSets = CATEGORY_META[categoryId].sets;
  let setId = overrides.setId || parsed.setId;
  if(!setId || SETS[setId].category!==categoryId) setId = catSets[0];
  const set = SETS[setId];
  const rarityName = overrides.rarityName || parsed.rarityName || set.rarities[0].name;
  const rarity = set.rarities.find(r=>r.name===rarityName) || set.rarities[0];
  const grade = overrides.grade || parsed.grade || "Raw";
  return { character: parsed.character, isCustom: parsed.isCustom, categoryId, setId, set, rarity, grade };
}
function cycle(list, current, dir){
  const i = list.indexOf(current);
  const next = (i<0?0:(i+dir+list.length))%list.length;
  return list[next];
}

// ---------- generation ----------
function buildTitle(s){
  const parts = [s.character, "VeeFriends", s.set.year, s.set.shortLabel];
  const isBase = ["Base","Base Chrome","Core"].includes(s.rarity.name);
  if(!isBase) parts.push(s.rarity.name);
  if(s.rarity.run && !TRIVIAL_RUNS.has(s.rarity.run) && s.rarity.run.length<=16) parts.push(s.rarity.run);
  parts.push(s.grade==="Raw" ? "Raw" : s.grade);
  let title = parts.filter(Boolean).join(" ");
  if(title.length>80){
    const noRun = [s.character,"VeeFriends",s.set.year,s.set.shortLabel, !isBase?s.rarity.name:null, s.grade==="Raw"?"Raw":s.grade].filter(Boolean).join(" ");
    title = noRun.length<=80 ? noRun : title.slice(0,80);
  }
  return title;
}
function buildDescription(s){
  const graded = s.grade!=="Raw";
  const isBase = ["Base","Base Chrome","Core"].includes(s.rarity.name);
  const rarityBit = isBase ? "" : ` (${s.rarity.name}${s.rarity.run && !TRIVIAL_RUNS.has(s.rarity.run) ? ", "+s.rarity.run : ""})`;
  const itemWord = CATEGORY_META[s.categoryId].itemLabel.toLowerCase();
  const cond = graded
    ? `Professionally graded ${s.grade}. See photos for exact condition.`
    : `Raw / ungraded — please review photos closely for condition before buying.`;
  return `You're buying the ${s.character} ${itemWord} from the ${s.set.label} release${rarityBit}.\n\n${cond}\n\nShips same or next business day, securely packaged. Smoke-free home. Message me with any questions before buying!`;
}
function compsUrl(s, broad){
  const q = broad ? `${s.character} veefriends` : `${s.character} veefriends ${s.rarity.name!=="Base"&&s.rarity.name!=="Core"?s.rarity.name:""}`.trim();
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1&_sacat=0`;
}
function slugFor(s){
  return ["card", s.character, s.categoryId, s.setId, s.rarity.name, s.grade].join("-")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,180);
}


export {
  SETS, CATEGORY_META, CATEGORY_ORDER, ALL_CHARACTERS, GRADE_CYCLE, DEFAULT_OVERRIDES,
  parseQuery, effectiveState, buildTitle, buildDescription, compsUrl, slugFor, cycle,
};
