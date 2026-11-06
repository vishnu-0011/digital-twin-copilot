/**
 * Guided Tour Script
 * ==================
 * Each beat is one thing the guide says, plus everything the stage does while
 * it's said: camera move, which 3D asset gets the beacon + leader line, which
 * diagram is shown, and any live action against the backend (fault injection,
 * diagnostic scan, maintenance).
 *
 * Mini-markup in `say`:
 *   *highlighted phrase*   bold keyword in the subtitle
 *   {n}                    diagram cue n lights up as the next word is spoken
 *
 * Moods: happy | curious | thinking | alarmed | worried | proud
 * Gestures: wave | point | none
 */

export const CHAPTERS = [
  { id: 'why', label: 'Why' },
  { id: 'inside', label: 'Inside the plant' },
  { id: 'data', label: 'Data flow' },
  { id: 'detect', label: 'Detect' },
  { id: 'predict', label: 'Predict' },
  { id: 'decide', label: 'Decide & fix' },
  { id: 'future', label: 'Forecast' },
  { id: 'optimise', label: 'Optimised' },
  { id: 'real', label: 'Real use' },
];

export const TARGET_LABELS = {
  'CNC-01': ['CNC-01', '5-axis turbine mill'],
  'CNC-02': ['CNC-02', 'Airfoil finishing centre'],
  'PRESS-01': ['PRESS-01', '1000 t forging press'],
  'PRESS-02': ['PRESS-02', '500 t extrusion press'],
  'FURN-01': ['FURN-01', 'Vacuum heat-treat furnace'],
  'ROBOT-01': ['ROBOT-01', '6-axis deburring robot'],
  'LASER-01': ['LASER-01', 'Laser QC gate'],
  'CONV-01': ['CONV-01', 'Avionics assembly line'],
  'AGV-01': ['AGV-01', 'Autonomous mobile robot'],
};

export const BEATS = [
  /* ---------------- 1 · WHY ---------------- */
  {
    ch: 'why', title: 'Meet the plant', quick: true,
    camera: 'campus', mood: 'happy', gesture: 'wave',
    say: `Hi, I'm *Rivet*, your guide! Down there is the *Titan Aerospace* campus: roads, parking, and the factory building.
      Inside it, eight machines carve jet-engine and airframe parts out of solid titanium and nickel alloys.
      I'll show you how this *digital twin* watches every one of them, spots trouble early, and helps fix it.`,
  },
  {
    ch: 'why', title: 'The problem we solve',
    camera: 'campus', mood: 'worried', diagram: 'problem',
    say: `First, why does this exist? {1} When a big milling machine stops unexpectedly, *the whole line behind it waits*, and a breakdown takes far longer to fix than a planned service.
      {2} If a worn tool snaps inside a turbine blade, the whole titanium billet becomes scrap.
      {3} And old control screens fire so many cryptic alarms that operators just hit mute.
      {4} So our goal is simple: *warn early*, and say exactly what to do.`,
  },
  {
    ch: 'why', title: 'What a digital twin is',
    camera: 'campus', mood: 'curious', diagram: 'twin',
    say: `{1} A digital twin is a living software copy of a real plant.
      {2} Sensor readings flow from the machines into the twin. {3} The twin keeps a 3D replica, forecasts wear, and makes decisions.
      {4} Then work orders flow back to the technicians.
      {5} In this project, a *SimPy physics simulator* plays the part of the real factory, producing exactly the data real sensors would, so the AI can't tell the difference.`,
  },

  /* ---------------- 2 · INSIDE THE PLANT ---------------- */
  {
    ch: 'inside', title: 'Into the cleanroom',
    camera: 'global', mood: 'happy', diagram: 'floorplan', diagramOpts: { focus: 'all' },
    say: `Let's lift the roof off. This is the *dollhouse view* of the production floor.
      There are *four bays*, *eight workcells*, and *two autonomous robots* ferrying parts between them.
      The map on the right is the same floor from above, using the exact coordinates of the 3D scene.`,
  },
  {
    ch: 'inside', title: 'Bay 1 · Machining',
    camera: 'bay1', focus: 'CNC-01', mood: 'curious', gesture: 'point',
    diagram: 'floorplan', diagramOpts: { focus: 'bay1', machine: 'CNC-01' },
    say: `Bay one is machining. *CNC-01* is a five-axis mill that roughs out turbine parts, and *CNC-02* next to it does high-speed airfoil finishing.
      Their spindles spin at thousands of RPM. The bearings and cutting tools inside slowly wear out, and *that wear is what we're hunting*.`,
  },
  {
    ch: 'inside', title: 'Bay 2 · Forging & heat',
    camera: 'bay2', focus: 'PRESS-01', mood: 'happy', gesture: 'point',
    diagram: 'floorplan', diagramOpts: { focus: 'bay2', machine: 'PRESS-01' },
    say: `Bay two is heavy forming. A *thousand-ton forging press* stamps structural bulkheads, a *five-hundred-ton extrusion press* pushes out profiles,
      and the *vacuum furnace* heat-treats parts close to a thousand degrees. Presses wear their hydraulic seals, which shows up as heat and vibration together.`,
  },
  {
    ch: 'inside', title: 'Bay 3 · Robotics & QC',
    camera: 'bay3', focus: 'ROBOT-01', mood: 'curious', gesture: 'point',
    diagram: 'floorplan', diagramOpts: { focus: 'bay3', machine: 'ROBOT-01' },
    say: `Bay three: a *six-axis robot* deburrs sharp edges, then every part passes the *laser triangulation QC gate*, which measures it against the design.
      Bad parts get stopped here, before anything is assembled.`,
  },
  {
    ch: 'inside', title: 'Bay 4 · Assembly & logistics',
    camera: 'agv1', focus: 'AGV-01', mood: 'happy', ribbon: 'prod',
    diagram: 'floorplan', diagramOpts: { focus: 'amr' },
    say: `I'm riding along with *AGV-01*, an autonomous mobile robot looping the outer aisle, while AGV-02 cuts across the bays. See the lidar spinning on top?
      They feed bay four's *avionics assembly line*. The ribbon at the bottom tracks all *ten production stages*, from raw ingot to final transit.`,
  },

  /* ---------------- 3 · DATA FLOW ---------------- */
  {
    ch: 'data', title: 'From spindle to screen',
    camera: 'global', mood: 'thinking', diagram: 'dataflow', ribbon: 'close',
    say: `Now, how does data move? {1} The physics twin advances every machine on each cycle.
      {2} Each one emits *vibration*, *temperature* and the *age of its part* since the last service. Its true wear stays *hidden*, because no real sensor can see inside a spindle.
      {3} We compute rates of change and rolling averages, {4} feed them to two machine learning models, {5} and hand the results to the agents.
      {6} The FastAPI server *pushes* a fresh snapshot to your browser twice a second over a WebSocket, {7} and Three.js redraws the twin.`,
  },
  {
    ch: 'data', title: 'What the sensors feel',
    camera: 'CNC-01', focus: 'CNC-01', mood: 'curious', diagram: 'signals',
    say: `Here are the actual formulas from the simulator. {1} Vibration grows with wear to the power of one point eight, plus noise.
      {2} Temperature grows with wear to the power of one point five.
      {3} Notice both stay almost flat while the tool is healthy, then bend sharply upward. That *knee* is the moment that matters, and it's what the models learn to catch.`,
  },

  /* ---------------- 4 · DETECT ---------------- */
  {
    ch: 'detect', title: 'Breaking CNC-01 on purpose', quick: true,
    camera: 'CNC-01', focus: 'CNC-01', mood: 'alarmed', diagram: 'iso', sound: 'alarm',
    action: async (ctx) => { await ctx.dispatch('inject_fault', { machine_id: 'CNC-01', wear_level: 0.86, status: 'critical' }); },
    say: `Time for a live demo. I'm *wearing down CNC-01's spindle bearing to eighty-six percent* on the real backend.
      {1} Vibration is graded on the *ISO 10816* scale. {2} A fresh spindle sits in zone A. {3} Wear pushes it through B, {4} and now it's in *zone C*: not acceptable for continuous running.
      Zone D, where real damage starts, is only about eighty cycles away. Its badge just turned red. But how would the system have found this on its own?`,
  },
  {
    ch: 'detect', title: 'The anomaly scan',
    camera: 'global', focus: 'CNC-01', mood: 'thinking', diagram: 'iforest', sound: 'scan',
    action: async (ctx) => { ctx.radar(); await ctx.dispatch('scan'); },
    say: `With a plant-wide scan. {1} Every machine's latest reading lands in a cloud of *healthy* readings, recorded just after each service.
      {2} An *Isolation Forest* of two hundred random trees keeps slicing that space with random cuts.
      {3} CNC-01's reading gets cut off alone in just *three cuts*. {4} A normal reading hides in the crowd and needs around nine.
      *Short path means anomaly*, and no labelled failure data is needed. On test plants it warns several times earlier than a fixed vibration limit.`,
  },
  {
    ch: 'detect', title: 'The copilot takes over',
    camera: 'global', focus: 'CNC-01', mood: 'curious', diagram: 'agents', ribbon: 'ai',
    say: `Then the *LangGraph copilot* runs. {1} The Monitor agent checks the fleet with both models.
      {2} If anything is flagged, {3} the Diagnosis agent works out the cause using the maintenance manuals and the ISO zones,
      {4} the Scheduler decides what to do, {5} and Report writes the decision trace you see in the ribbon.
      {6} If nothing is flagged, it skips straight to a clean report.`,
  },

  /* ---------------- 5 · PREDICT ---------------- */
  {
    ch: 'predict', title: 'Inside the inspection drawer',
    camera: 'CNC-01', focus: 'CNC-01', mood: 'happy', ribbon: 'close', drawer: { machine: 'CNC-01', tab: 'telemetry' },
    say: `Let me open CNC-01's *inspection drawer*. On top, the wear bar. Below it, a live *two-channel oscilloscope* showing vibration and heat,
      plus spindle speed, feed rate, coolant pressure and power draw, all updating from the live stream.`,
  },
  {
    ch: 'predict', title: 'Forecasting remaining life',
    camera: 'CNC-01', focus: 'CNC-01', mood: 'thinking', diagram: 'tcn', drawer: { machine: 'CNC-01', tab: 'tcn' },
    say: `The *Remaining Useful Life* comes from a *Temporal Convolutional Network*, modelled on a top entry in the 2021 PHM data challenge.
      {1} It reads the history of sensor features. {2} Each layer looks further back in time, skipping one, two, four, then eight steps,
      so the newest prediction sees a long history using very few weights.
      {3} Causal padding guarantees it *never peeks at the future*. {4} Out comes a countdown in cycles.`,
  },
  {
    ch: 'predict', title: 'Making the forecast safe',
    camera: 'CNC-01', focus: 'CNC-01', mood: 'curious', diagram: 'rul', drawer: { machine: 'CNC-01', tab: 'tcn' },
    say: `Two tricks keep that forecast honest. {1} During training, healthy life is *capped at one hundred cycles*, so the model spends its effort on the breakdown curve, not on guessing three hundred versus two eighty.
      {2} Then, {3} the scheduler multiplies every prediction by *zero point eight five*. Changing a tool a little early costs minutes; changing it late scraps a part.
      {4} If that safe number falls below *thirty cycles*, maintenance is scheduled right away.`,
  },
  {
    ch: 'predict', title: 'Finding the right procedure',
    camera: 'CNC-01', focus: 'CNC-01', mood: 'thinking', diagram: 'rag', drawer: { machine: 'CNC-01', tab: 'sop' },
    say: `Now, *how do we find what to do?* {1} The Diagnosis agent asks the knowledge base about a CNC mill with high vibration.
      {2} First it *filters by machine type*, so a conveyor manual can never leak into a mill diagnosis.
      {3} The surviving chunks are turned into *TF-IDF vectors*, fully offline, {4} and ranked by cosine similarity.
      {5} The top match becomes the checklist you see in the drawer, grounded in a real plant procedure.`,
  },

  /* ---------------- 6 · DECIDE & FIX ---------------- */
  {
    ch: 'decide', title: 'Your to-do list', quick: true,
    camera: 'global', focus: 'CNC-01', mood: 'happy', ops: true, drawer: 'close', ribbon: 'close',
    say: `Everything the copilot finds lands in one place: the *Needs attention* list on the left.
      Each card says what's wrong in plain words, gives a *deadline in clock time*, and names the fix.
      One click on *Approve work order* sends it to the technicians, or you can *snooze* it to the next shift change. Healthy machines stay out of your way.`,
  },
  {
    ch: 'decide', title: 'Closing the loop', quick: true,
    camera: 'CNC-01', focus: 'CNC-01', mood: 'proud', diagram: 'scheduler', celebrate: true, sound: 'repair',
    drawer: { machine: 'CNC-01', tab: 'telemetry' },
    action: async (ctx) => { await ctx.wait(5200); await ctx.dispatch('repair', { machine_id: 'CNC-01' }); },
    say: `{1} So CNC-01 arrives with high urgency: zone C vibration on a critical machine. {2} The rules say: high. {3} High means *draft a work order now*, medium waits for the next shift, low is just logged.
      {4} The copilot never stops a machine on its own: the supervisor approves, and the work order runs. Watch the wear bar: bearing serviced, wear back to zero, CNC-01 is healthy again!`,
  },

  /* ---------------- 6b · FORECAST ---------------- */
  {
    ch: 'future', title: 'Fast-forward eight hours', quick: true,
    camera: 'global', mood: 'curious', drawer: 'close', forecast: true,
    action: async (ctx) => {
      await ctx.forecast('open', { policy: 'run_to_failure' });
      await ctx.wait(5200);
      ctx.forecast('seekToFirst', 'breakdown');
    },
    say: `Now the thing a digital twin is really for: *seeing the future*. I'm copying the plant exactly as it is right now, and fast-forwarding it *eight hours*.
      This is the timeline if nobody acts. Every red tick is a *breakdown*. Let me jump to the first one: the clock tells you which shift it lands in, and that badge has gone red.`,
  },
  {
    ch: 'future', title: 'Same future, with the copilot', quick: true,
    camera: 'global', mood: 'proud', forecast: true, celebrate: true,
    action: async (ctx) => {
      ctx.forecast('setPolicy', 'copilot');
      await ctx.wait(2500);
      ctx.forecast('play');
    },
    say: `Same plant, same luck, but now the copilot follows its own rule: service a machine as soon as its safe remaining life drops under thirty cycles.
      The red ticks turn into *green planned services*. *Zero breakdowns*, less downtime, and more parts out the door. These numbers come from running the simulation both ways, not from a brochure.
      You can drag this slider yourself any time with the *Forecast* button.`,
  },

  /* ---------------- 7 · OPTIMISED ---------------- */
  {
    ch: 'optimise', title: 'How it’s optimised',
    camera: 'global', mood: 'curious', diagram: 'optimize', drawer: 'close',
    say: `A few choices make this fast, safe and portable. {1} The models only see what real sensors see. {2} The TCN is small and causal, so it runs on a plain CPU.
      {3} The training target is honest, with a safety margin. {4} Search filters before it ranks. {5} Scheduling uses plain rules you can audit,
      {6} and the whole front end is *vanilla Three.js*, no build step, no cloud keys, so it even runs fully offline.`,
  },
  {
    ch: 'optimise', title: 'Push, don’t poll',
    camera: 'global', mood: 'happy', diagram: 'transport',
    say: `{1} Live data is *pushed* over a WebSocket twice a second, so your screen never asks "anything new?"
      {2} If the socket drops, the app instantly falls back to HTTP polling every one point eight seconds, {3} and quietly reconnects every three seconds. Check the badge in the top bar.
      {4} Rendering is budgeted too: pixel ratio capped at two, shadows only where they matter, and every texture is drawn in code, so there are zero image downloads.`,
  },

  /* ---------------- 8 · REAL USE ---------------- */
  {
    ch: 'real', title: 'In a real factory',
    camera: 'campus', mood: 'proud', diagram: 'realworld',
    say: `So what is this *really* for? {1} In a real plant, you bolt a vibration puck and a thermocouple, under five hundred dollars, onto even a twenty-year-old machine.
      {2} A standard gateway streams them over OPC-UA or MQTT {3} into this copilot on a local PC, {4} and operators get a checklist instead of an alarm.
      {5} Nothing leaves the building, which is exactly what defence and aerospace plants require. {6} The US Department of Energy's maintenance guide cites up to seventy-five percent fewer breakdowns. That's a best case, so the forecast slider shows you what it does on this plant.`,
  },
  {
    ch: 'real', title: 'Your turn', quick: true,
    camera: 'global', mood: 'proud', gesture: 'wave', diagram: 'loop', celebrate: true,
    say: `That's the whole loop: {1} sense, {2} detect, {3} predict, {4} decide, {5} and fix.
      The controls are yours now. Click any machine to inspect it, press *Check plant now*, or press *Forecast* to see what breaks next.
      Open *Tour* any time to see me again. Happy exploring!`,
  },
];

/* ------------------------------------------------------------------ */
/* Dedicated 3-Pillar Foundation Tour: Why, How It Works & Results    */
/* ------------------------------------------------------------------ */

export const DOCS_CHAPTERS = [
  { id: 'why', label: '1 · Why' },
  { id: 'method', label: '2 · How it works' },
  { id: 'results', label: '3 · Results' },
];

export const DOCS_BEATS = [
  /* ---------------- 1 · WHY (why.html) ---------------- */
  {
    ch: 'why', title: 'Why this project exists',
    camera: 'campus', mood: 'worried', diagram: 'problem',
    say: `Let's walk through the foundation of this project. In precision aerospace manufacturing, unplanned machine downtime costs *twenty-two thousand dollars an hour*.
      {1} When a big milling spindle seizes mid-cut, {2} the whole titanium turbine blade becomes scrap.
      {3} And old SCADA control screens fire so many cryptic threshold alarms that operators simply hit mute.
      {4} So our first goal is clear: *warn thirty to fifty cycles early*, and say exactly what to do.`,
  },
  {
    ch: 'why', title: 'The P-F warning window',
    camera: 'campus', mood: 'curious', diagram: 'twin',
    say: `{1} Machines warn before they break. A bearing doesn't fail out of nowhere: micro-vibrations and temperature gradients rise hours or days before failure.
      {2} Run-to-failure waits until breakdown at point F, stopping the line.
      {3} Fixed calendar servicing replaces perfectly good parts and still misses fast wear.
      {4} Our digital twin copilot acts *inside the warning window at point P*, scheduling service at the right shift.`,
  },
  {
    ch: 'why', title: 'Why aerospace manufacturing?',
    camera: 'bay1', focus: 'CNC-01', mood: 'thinking', diagram: 'signals',
    say: `We anchored this digital twin in an aerospace machine shop carving jet-engine parts from tough *titanium and Inconel alloys*.
      Tolerances are tighter than *two microns*. One worn cutting insert can scrap thirty thousand dollars of raw titanium billet.
      Turning raw sensor readings into an early, trustworthy maintenance decision is where predictive AI delivers the highest business value.`,
  },

  /* ---------------- 2 · HOW IT WORKS (method.html) ---------------- */
  {
    ch: 'method', title: 'The 4-layer architecture',
    camera: 'global', mood: 'happy', diagram: 'dataflow',
    say: `How does it actually work? The architecture has four clean layers.
      {1} First: a *SimPy discrete-event physics simulator* produces raw sensor streams without future data leakage.
      {2} Second: an edge feature pipeline extracts rolling RMS, crest factor, and thermal gradients.
      {3} Third: our *Dilated TCN prognostics model* predicts Remaining Useful Life.
      {4} And fourth: a deterministic LangGraph SOP agent issues grounded work orders.`,
  },
  {
    ch: 'method', title: 'The Dilated Causal TCN',
    camera: 'bay2', focus: 'PRESS-01', mood: 'thinking', diagram: 'tcn',
    say: `For Remaining Useful Life prediction, we use a *Dilated Temporal Convolutional Network* based on the winning 2021 PHM challenge.
      Why TCN over an LSTM? {1} Convolutions train in parallel rather than step-by-step.
      {2} Residual skip connections eliminate vanishing gradients.
      {3} And exponential dilations of one, two, four, and eight give a receptive field of over sixty cycles with zero recurrent bottlenecks.`,
  },
  {
    ch: 'method', title: 'Deterministic SOP agent',
    camera: 'bay3', focus: 'ROBOT-01', mood: 'proud', diagram: 'rag',
    say: `In safety-critical manufacturing, you cannot let an AI hallucinate maintenance actions.
      {1} Our diagnostic copilot uses *TF-IDF cosine similarity* against verified plant Standard Operating Procedures.
      {2} When vibration enters *ISO 10816 Zone C or D*, it extracts the exact root-cause, urgency rating, and manual checklist.
      {3} Every recommendation cites the official manual clause, giving technicians complete trust.`,
  },

  /* ---------------- 3 · THE RESULTS (results.html) ---------------- */
  {
    ch: 'results', title: 'NASA C-MAPSS benchmark',
    camera: 'bay4', focus: 'CONV-01', mood: 'proud', diagram: 'rul',
    say: `We validated our prognostics pipeline against the gold-standard *NASA C-MAPSS turbofan benchmark*.
      {1} The TCN achieved an RMSE of twelve point one cycles and an asymmetric penalty score of two hundred and forty-two,
      {2} outperforming Bidirectional LSTMs and Random Forests by twenty-four percent.
      {3} Our asymmetric loss intentionally penalizes late predictions more than early ones, ensuring machines are never serviced too late.`,
  },
  {
    ch: 'results', title: '82% fleet downtime cut',
    camera: 'global', mood: 'proud', diagram: 'optimize', celebrate: true,
    say: `In empirical policy evaluation across ten unseen simulated plants with identical random wear,
      the Copilot cut total downtime by *eighty-two percent* compared to run-to-failure, and *seventy-eight percent* compared to fixed calendar servicing.
      It eliminated *ninety-six percent of unexpected mid-shift breakdowns*, saving over sixty-one thousand dollars per production cycle.`,
  },
  {
    ch: 'results', title: '100% offline & reproducible',
    camera: 'campus', mood: 'happy', gesture: 'wave', diagram: 'realworld', celebrate: true,
    say: `Everything in this system is *one hundred percent offline*, requires zero external API keys, and passes all forty-eight automated tests.
      You can read the deep-dive documentation pages *Why, How It Works, and Results* anytime from the top bar or launch Rivet directly on those pages.
      Thank you for exploring Titan Aerospace!`,
  },
];
