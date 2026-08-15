export type FormularyEntry = {
  id: string;
  name: string;
  category: "vitamin" | "mineral" | "performance" | "other";
  whatIsIt: string;
  whyItMatters: string;
  pairsWith: string[];
  takeCareWith: string[];
};

// General reference information, not medical advice — always check
// with a doctor or pharmacist before starting anything new, especially
// alongside existing medication.
export const formulary: FormularyEntry[] = [
  {
    id: "vitamin-d3",
    name: "Vitamin D3",
    category: "vitamin",
    whatIsIt:
      "A fat-soluble vitamin your skin produces from sunlight, and one of the most commonly low levels in people who spend most daylight hours indoors.",
    whyItMatters:
      "Supports calcium absorption and bone density, plays a role in immune function, and low levels are linked to fatigue and low mood, especially over winter months.",
    pairsWith: ["Vitamin K2 (directs the calcium D3 helps absorb toward bone)", "Magnesium (needed to convert D3 into its active form)", "A meal containing fat (it's fat-soluble, so absorption improves with food)"],
    takeCareWith: ["Very high doses over long periods without testing blood levels", "Calcium supplements, without medical guidance, if you have kidney issues"],
  },
  {
    id: "magnesium",
    name: "Magnesium",
    category: "mineral",
    whatIsIt:
      "An essential mineral involved in several hundred enzymatic reactions in the body, commonly taken as glycinate, citrate, or oxide forms.",
    whyItMatters:
      "Involved in muscle relaxation, nerve function, and sleep quality — glycinate in particular is often taken in the evening for this reason.",
    pairsWith: ["Vitamin D3 (needed for D3 metabolism)", "Evening routine — often taken alongside winding-down habits given the relaxation effect"],
    takeCareWith: ["High doses can cause digestive upset, particularly with the oxide or citrate forms", "Certain antibiotics and blood pressure medications — check interactions"],
  },
  {
    id: "creatine-monohydrate",
    name: "Creatine monohydrate",
    category: "performance",
    whatIsIt:
      "One of the most researched sports supplements available — a compound your body already produces and stores in muscle, used to regenerate ATP during short, intense effort.",
    whyItMatters:
      "Well-supported for increasing strength, power output, and lean muscle mass over time when paired with resistance training. Effects build gradually with consistent daily use rather than immediately.",
    pairsWith: ["Consistent daily dosing (timing relative to training matters far less than daily consistency)", "Adequate water intake"],
    takeCareWith: ["Stopping and restarting frequently — consistency is what drives the benefit", "Existing kidney conditions — check with a doctor first even though it's well-tolerated for most people"],
  },
  {
    id: "omega-3",
    name: "Omega-3 (fish oil)",
    category: "other",
    whatIsIt:
      "Long-chain fatty acids (EPA and DHA) found in oily fish, taken as a supplement when dietary intake is low.",
    whyItMatters:
      "Associated with cardiovascular health and may help manage exercise-induced inflammation, supporting recovery between sessions.",
    pairsWith: ["A meal containing fat, for absorption"],
    takeCareWith: ["Blood-thinning medication — omega-3 can have a mild blood-thinning effect itself", "Low-quality/oxidized products — smell and taste are a reasonable quality check"],
  },
  {
    id: "zinc",
    name: "Zinc",
    category: "mineral",
    whatIsIt:
      "An essential trace mineral involved in immune function, wound healing, and hormone regulation, including testosterone production.",
    whyItMatters:
      "Commonly low in people with high training volume, since it's lost through sweat — relevant for recovery and immune resilience during heavy training blocks.",
    pairsWith: ["Taken away from high-calcium meals or supplements, which compete for absorption"],
    takeCareWith: ["Copper — long-term high-dose zinc can deplete copper levels", "Taking on an empty stomach — can cause nausea in some people"],
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    category: "vitamin",
    whatIsIt:
      "A water-soluble vitamin essential for red blood cell formation and nerve function, found naturally almost exclusively in animal products.",
    whyItMatters:
      "Particularly relevant if you eat a mostly plant-based diet, since deficiency can cause fatigue and low energy that's easy to mistake for poor sleep or overtraining.",
    pairsWith: ["Folate (works alongside B12 in red blood cell production)"],
    takeCareWith: ["Nothing significant — it's water-soluble and excess is simply excreted"],
  },
  {
    id: "electrolytes",
    name: "Electrolytes (sodium, potassium, magnesium blend)",
    category: "other",
    whatIsIt:
      "A mix of minerals lost through sweat during training, replaced through food or a dedicated electrolyte product.",
    whyItMatters:
      "Supports hydration and can reduce cramping during longer or higher-sweat sessions — more relevant the more you sweat, not a universal daily need for everyone.",
    pairsWith: ["Water intake around training", "Higher-sweat activities like running, especially in heat"],
    takeCareWith: ["High blood pressure — check the sodium content of the specific product"],
  },
  {
    id: "vitamin-c",
    name: "Vitamin C",
    category: "vitamin",
    whatIsIt:
      "A water-soluble antioxidant vitamin involved in collagen synthesis, immune function, and iron absorption.",
    whyItMatters:
      "Supports connective tissue repair (relevant for joint and tendon health under training load) and immune resilience during heavy training blocks.",
    pairsWith: ["Iron (non-heme iron absorbs better alongside vitamin C)"],
    takeCareWith: ["High doses can cause digestive upset — spreading intake across the day helps"],
  },
  {
    id: "iron",
    name: "Iron",
    category: "mineral",
    whatIsIt:
      "An essential mineral central to red blood cell formation and oxygen transport, commonly taken as ferrous sulfate or a gentler bisglycinate form.",
    whyItMatters:
      "Low iron shows up as fatigue and reduced endurance capacity — relevant for anyone with high training volume, and particularly for menstruating athletes and vegetarians/vegans.",
    pairsWith: ["Vitamin C (improves absorption)"],
    takeCareWith: [
      "Calcium and dairy — both reduce iron absorption if taken at the same time",
      "Only supplement if blood work actually shows low levels — excess iron isn't simply excreted like water-soluble vitamins",
    ],
  },
  {
    id: "multivitamin",
    name: "Multivitamin",
    category: "vitamin",
    whatIsIt:
      "A broad-spectrum blend of vitamins and minerals at roughly daily-requirement doses, meant as dietary insurance rather than a targeted intervention.",
    whyItMatters:
      "Useful as a baseline safety net if diet is inconsistent, though it won't move the needle the way a targeted deficiency correction (like fixing low vitamin D or iron) would.",
    pairsWith: ["Taken with a meal — most fat-soluble vitamins inside absorb better with food"],
    takeCareWith: ["Doubling up with individual supplements that overlap — check doses don't stack unintentionally"],
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    category: "other",
    whatIsIt:
      "An adaptogenic herb used in Ayurvedic medicine, most commonly taken as a root extract (KSM-66 and Sensoril are the two studied forms).",
    whyItMatters:
      "Some evidence for reduced perceived stress and improved sleep quality; a smaller body of evidence suggests modest strength and recovery benefits in trained lifters.",
    pairsWith: ["Evening routine, given the relaxation-adjacent effect for many people"],
    takeCareWith: [
      "Thyroid conditions — ashwagandha can affect thyroid hormone levels",
      "Pregnancy — not recommended",
    ],
  },
  {
    id: "melatonin",
    name: "Melatonin",
    category: "other",
    whatIsIt:
      "A hormone your body produces naturally in response to darkness, taken as a supplement to help shift or support sleep timing.",
    whyItMatters:
      "Most useful for shifting sleep timing (jet lag, irregular schedules) rather than as a nightly sleep aid — effective doses are much lower than what most commercial products contain.",
    pairsWith: ["A consistent, dark sleep environment — melatonin works with your routine, not instead of one"],
    takeCareWith: [
      "Higher doses than ~0.5-1mg often aren't more effective and can cause grogginess",
      "Daily long-term use without a specific reason — better used situationally",
    ],
  },
  {
    id: "vitamin-k2",
    name: "Vitamin K2",
    category: "vitamin",
    whatIsIt:
      "A fat-soluble vitamin that directs calcium toward bone and away from soft tissue, distinct from vitamin K1 (found in leafy greens, mainly involved in blood clotting).",
    whyItMatters:
      "Commonly paired with vitamin D3 supplementation, since D3 increases calcium absorption and K2 helps ensure that calcium ends up in bone rather than arteries.",
    pairsWith: ["Vitamin D3", "A meal containing fat, for absorption"],
    takeCareWith: ["Blood thinners (warfarin) — vitamin K affects clotting, so check with a doctor first"],
  },
  {
    id: "probiotics",
    name: "Probiotics",
    category: "other",
    whatIsIt:
      "Live beneficial bacteria strains, taken to support gut microbiome diversity — strain matters more than a generic \"probiotic\" label.",
    whyItMatters:
      "Gut health has downstream links to nutrient absorption and immune function, both relevant to recovery during heavy training.",
    pairsWith: ["A varied, fiber-rich diet — probiotics work better alongside prebiotic fiber, not instead of it"],
    takeCareWith: ["Effects are strain-specific — a product not naming its strains is hard to evaluate"],
  },
  {
    id: "collagen",
    name: "Collagen peptides",
    category: "other",
    whatIsIt:
      "Hydrolyzed collagen protein, typically from bovine or marine sources, taken for joint and connective tissue support.",
    whyItMatters:
      "Some evidence supports collagen intake paired with vitamin C and loading exercise for tendon/ligament resilience — relevant if you're managing joint stress from heavy training.",
    pairsWith: ["Vitamin C (involved in collagen synthesis)", "Taken 30-60 minutes before connective-tissue-loading exercise, per the supporting research protocol"],
    takeCareWith: ["Not a substitute for adequate total protein intake — it's a specific addition, not a replacement"],
  },
  {
    id: "beta-alanine",
    name: "Beta-alanine",
    category: "performance",
    whatIsIt:
      "An amino acid that raises muscle carnosine levels, which buffers acid buildup during high-intensity effort.",
    whyItMatters:
      "Most useful for sustained high-intensity work in the 1-4 minute range (think higher-rep sets, sprints, Hyrox-style efforts) rather than pure 1-3 rep strength work.",
    pairsWith: ["Creatine — commonly stacked, since they support different aspects of performance"],
    takeCareWith: ["A harmless tingling sensation (paresthesia) at higher doses — split doses through the day if it bothers you"],
  },
  {
    id: "caffeine",
    name: "Caffeine",
    category: "performance",
    whatIsIt:
      "A well-studied stimulant that improves alertness and can measurably improve strength and endurance performance, typically taken 30-60 minutes pre-training.",
    whyItMatters:
      "One of the few supplements with strong, consistent evidence for a direct performance benefit — improved power output, reduced perceived effort.",
    pairsWith: ["L-theanine (takes the edge off jitters for some people)"],
    takeCareWith: [
      "Training late in the day — caffeine has a long half-life and can disrupt sleep hours later",
      "Building tolerance with daily high-dose use, which blunts the performance benefit over time",
    ],
  },
  {
    id: "l-theanine",
    name: "L-theanine",
    category: "other",
    whatIsIt:
      "An amino acid found naturally in tea, often paired with caffeine to smooth out its stimulant effect.",
    whyItMatters:
      "Associated with calm, focused alertness rather than jittery stimulation — relevant if caffeine alone makes you anxious or overstimulated.",
    pairsWith: ["Caffeine — the classic pairing, usually at roughly a 2:1 theanine-to-caffeine ratio"],
    takeCareWith: ["Nothing significant at typical doses"],
  },
  {
    id: "calcium",
    name: "Calcium",
    category: "mineral",
    whatIsIt:
      "The primary mineral component of bone, most people get adequate amounts from dairy and fortified foods without needing to supplement.",
    whyItMatters:
      "Relevant for bone density, particularly under sustained high-impact training load — but oversupplementing without a dietary gap isn't beneficial and can compete with other mineral absorption.",
    pairsWith: ["Vitamin D3 (needed for calcium absorption)", "Vitamin K2 (directs it toward bone)"],
    takeCareWith: ["Iron and zinc — calcium competes with both for absorption if taken together"],
  },
  {
    id: "turmeric-curcumin",
    name: "Turmeric / Curcumin",
    category: "other",
    whatIsIt:
      "The active compound in turmeric root, taken as a concentrated extract for its anti-inflammatory properties — poorly absorbed on its own, usually paired with piperine (black pepper extract).",
    whyItMatters:
      "Some evidence for reduced exercise-induced muscle soreness, though effects are modest and absorption-dependent.",
    pairsWith: ["Piperine/black pepper extract (dramatically improves absorption)", "A meal containing fat"],
    takeCareWith: ["Blood thinners — curcumin has mild blood-thinning properties", "Gallbladder issues — check with a doctor first"],
  },
  {
    id: "whey-protein",
    name: "Whey protein",
    category: "performance",
    whatIsIt:
      "A fast-digesting, complete protein derived from milk, used to help hit daily protein targets conveniently rather than as anything metabolically special on its own.",
    whyItMatters:
      "Total daily protein intake is what drives muscle repair and growth — whey is simply a convenient, well-absorbed way to close a gap between what you eat and what you need.",
    pairsWith: ["Spread across meals rather than dumped entirely post-workout — timing matters far less than total daily intake"],
    takeCareWith: ["Lactose intolerance — a whey isolate or plant-based alternative digests easier than concentrate"],
  },
  {
    id: "citrulline-malate",
    name: "Citrulline malate",
    category: "performance",
    whatIsIt:
      "An amino acid compound that supports nitric oxide production and blood flow, commonly taken pre-workout.",
    whyItMatters:
      "Associated with reduced muscle soreness and modestly improved training volume in higher-rep work, likely via improved blood flow to working muscle.",
    pairsWith: ["Taken 30-60 minutes pre-training, at an effective dose (most studies use 6-8g, well above what's in most pre-workout blends)"],
    takeCareWith: ["Mild GI discomfort at higher doses for some people"],
  },
];
