/* js/ui-interactions.js */

/**
 * Handles user interactions, maps sound parameters to visual parameters
 * expected by the adapted "original" shader, and manages the main loop.
 * v1.2 - Replaced knobs with sliders, added input swapping.
 */

// Import Core Modules
import { HypercubeCore } from '../core/HypercubeCore.js';
import { ShaderManager } from '../core/ShaderManager.js';
import { GeometryManager } from '../core/GeometryManager.js';
import { ProjectionManager } from '../core/ProjectionManager.js';
import SoundModule from '../sound/sound-module.js';

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Initializing MALIFICARUM v1.2...");

    // --- Module Instances ---
    let mainVisualizerCore = null;
    let shaderManager = null;
    let geometryManager = null;
    let projectionManager = null;
    let soundModule = null;

    // --- State ---
    const uiState = {
        params: { // Stores normalized slider values (0-1) - Renamed from knobs
            'slider-filter': 0.5,
            'slider-resonance': 0.1,
            'slider-attack': 0.1,
            'slider-release': 0.3,
        },
        xyPad: { x: 0.5, y: 0.5, active: false },
        toggles: {
            'toggle-delay': false,
            'toggle-reverb': false,
            'toggle-arpeggiator': false,
            'toggle-glitch': false,
        },
        glitchEnabled: false,
        activeInputMode: 'keyboard', // 'keyboard' or 'xy'
        activeNoteSource: null,
        currentPreset: 'vaporwave',
        focusedModuleId: null, // Store ID of focused module
    };
    const audioAnalysisState = {
         bass: 0, mid: 0, high: 0, frequency: 440.0
    };

    let mainLoopId = null;

    // --- Initialization Functions --- (Keep initializeManagers, initializeSoundModule structure)

    function initializeManagers() {
        try {
            geometryManager = new GeometryManager();
            projectionManager = new ProjectionManager();
            console.log("Geometry and Projection Managers Initialized.");
            return true;
        } catch (error) {
            console.error("Error initializing Geometry/Projection Managers:", error);
            return false;
        }
    }

    function initializeMainVisualizer() {
        const canvas = document.getElementById('hypercube-canvas');
        if (!canvas) { console.error("Main visualizer canvas not found!"); return false; }
        try {
            const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }) ||
                       canvas.getContext('experimental-webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
            if (!gl) throw new Error("WebGL not supported!");

            shaderManager = new ShaderManager(gl, geometryManager, projectionManager);

            const initialProgramName = 'maleficarumAdaptedViz';
            const initialProj = projectionManager.options.defaultProjection;
            shaderManager.createDynamicProgram(initialProgramName, null, initialProj);

            mainVisualizerCore = new HypercubeCore(canvas, shaderManager, {
                shaderProgramName: initialProgramName,
                projectionMethod: initialProj,
                colorScheme: { background: [0.07, 0.05, 0.12, 1.0] },
                callbacks: { onError: (err) => console.error("Main Visualizer Error:", err) }
            });

            console.log("Main Visualizer Core Initialized (Adapted).");
            window.mainVisualizerCore = mainVisualizerCore; // For debug
            return true;
        } catch (error) {
            console.error("Error initializing Main Visualizer Core:", error);
            if (mainVisualizerCore) mainVisualizerCore.dispose();
            if (shaderManager) shaderManager.dispose();
            mainVisualizerCore = null; shaderManager = null; return false;
        }
    }

     async function initializeSoundModule() {
        try {
            soundModule = new SoundModule(uiState.currentPreset);
            console.log("SoundModule Instantiated.");
            const success = await soundModule.initPromise;
            if (success) {
                console.log("SoundModule Audio Context Ready.");
                updateUIFromSoundModuleState();
                return true;
            } else {
                console.error("Sound Module failed to initialize audio context.");
                alert("Audio engine failed to load. Visuals may be affected.");
                return false;
            }
        } catch (e) {
            console.error("Sound Module Instantiation failed:", e);
            alert("Audio engine failed to load. Visuals may be affected.");
            soundModule = null; return false;
        }
    }

    // --- UI Update Helpers ---

    function updateSliderVisual(sliderElement, normalizedValue) {
        if (!sliderElement) return;
        // Update the slider's actual value attribute (denormalize)
        const rawValue = Math.round(normalizedValue * (sliderElement.max - sliderElement.min) + sliderElement.min);
        sliderElement.value = rawValue;

        // Update the custom track fill visual
        const wrapper = sliderElement.closest('.slider-wrapper');
        if (wrapper) {
             const progress = (rawValue - sliderElement.min) / (sliderElement.max - sliderElement.min);
             wrapper.style.setProperty('--slider-progress', progress.toFixed(3));
        }
        // Update optional value display if exists
        // const valueDisplay = sliderElement.closest('.slider-unit').querySelector('.slider-value');
        // if (valueDisplay) { valueDisplay.textContent = `${Math.round(normalizedValue * 100)}%`; }
    }

    function updateToggleVisual(toggleInput, isChecked) {
        if (toggleInput) {
            toggleInput.checked = isChecked;
        }
    }

    function updateXYPadVisual(x, y) {
        const xyCursor = document.getElementById('xy-cursor');
        if(xyCursor) {
            xyCursor.style.left = `${x * 100}%`;
            xyCursor.style.top = `${y * 100}%`;
        }
    }

    function updateUIFromSoundModuleState() {
        if (!soundModule || !soundModule.audioState.parameters) {
            console.warn("Cannot update UI from SoundModule: Not ready or parameters missing.");
            return;
        }
        console.log("Updating UI from SoundModule state...");
        const soundParams = soundModule.audioState.parameters;

        // --- Sliders --- (Map sound param back to normalized 0-1)
        try {
            // Filter Freq: Log scale 20Hz to 15kHz
            const filterSlider = document.getElementById('slider-filter');
            if (filterSlider) {
                const minLogF = Math.log10(20); const maxLogF = Math.log10(15000);
                const currentFreq = Math.max(20, Math.min(15000, soundParams.filter.frequency));
                const normVal = Math.max(0, Math.min(1, (Math.log10(currentFreq) - minLogF) / (maxLogF - minLogF)));
                uiState.params['slider-filter'] = normVal;
                updateSliderVisual(filterSlider, normVal);
            }
            // Resonance (Q): Non-linear mapping 0.01 to 20
            const resSlider = document.getElementById('slider-resonance');
             if(resSlider) {
                 const normVal = Math.max(0, Math.min(1, Math.pow(soundParams.filter.Q / 20.0, 0.5)));
                 uiState.params['slider-resonance'] = normVal;
                 updateSliderVisual(resSlider, normVal);
             }
            // Attack: Log scale 0.005s to 2.5s
            const attackSlider = document.getElementById('slider-attack');
            if (attackSlider) {
                const minLogA = Math.log10(0.005); const maxLogA = Math.log10(2.5);
                const currentAttack = Math.max(0.005, Math.min(2.5, soundParams.envelope.attack));
                const normVal = Math.max(0, Math.min(1, (Math.log10(currentAttack) - minLogA) / (maxLogA - minLogA)));
                uiState.params['slider-attack'] = normVal;
                updateSliderVisual(attackSlider, normVal);
            }
            // Release: Log scale 0.01s to 5.0s
             const releaseSlider = document.getElementById('slider-release');
             if(releaseSlider) {
                const minLogR = Math.log10(0.01); const maxLogR = Math.log10(5.0);
                const currentRelease = Math.max(0.01, Math.min(5.0, soundParams.envelope.release));
                 const normVal = Math.max(0, Math.min(1, (Math.log10(currentRelease) - minLogR) / (maxLogR - minLogR)));
                 uiState.params['slider-release'] = normVal;
                 updateSliderVisual(releaseSlider, normVal);
             }
        } catch(e) { console.error("Error updating slider UI from sound state:", e); }

        // --- Toggles ---
        try {
             const effects = soundParams.effects || {};
             for (const effectName in effects) {
                 const toggleId = `toggle-${effectName}`;
                 const toggleInput = document.getElementById(toggleId);
                 if (toggleInput && effects[effectName]?.hasOwnProperty('active')) {
                     const isActive = effects[effectName].active;
                     uiState.toggles[toggleId] = isActive;
                     updateToggleVisual(toggleInput, isActive);
                     if (toggleId === 'toggle-glitch') {
                         uiState.glitchEnabled = isActive;
                     }
                 }
             }
        } catch(e) { console.error("Error updating toggle UI from sound state:", e); }

        // --- XY Pad --- (Visual state only, logic handled by interaction)
         try {
             const defaultX = 0.5;
             const minLogF = Math.log10(20); const maxLogF = Math.log10(15000);
             const currentFreq = Math.max(20, Math.min(15000, soundParams.filter.frequency));
             const freqNorm = (Math.log10(currentFreq) - minLogF) / (maxLogF - minLogF);
             const yVal = 1.0 - freqNorm; // Inverted Y visual
             uiState.xyPad.x = defaultX; // Keep visual centered initially
             uiState.xyPad.y = yVal;
             updateXYPadVisual(uiState.xyPad.x, uiState.xyPad.y);
         } catch(e) { console.error("Error updating XY Pad UI from sound state:", e); }

         console.log("UI updated to reflect sound state.");
     }

    // --- Parameter Mapping Helpers --- (Keep semantic names)

    function mapSliderToFilterFreq(normalizedValue) { // Logarithmic: 20Hz to 15kHz
        const minLog = Math.log10(20); const maxLog = Math.log10(15000);
        return Math.pow(10, minLog + normalizedValue * (maxLog - minLog));
    }
    function mapSliderToResonance(normalizedValue) { // Non-linear: 0.01 to 20
        return Math.max(0.01, Math.pow(normalizedValue, 2.0) * 20.0);
    }
    function mapSliderToAttack(normalizedValue) { // Logarithmic: 0.005s to 2.5s
        const minLog = Math.log10(0.005); const maxLog = Math.log10(2.5);
        return Math.pow(10, minLog + normalizedValue * (maxLog - minLog));
    }
    function mapSliderToRelease(normalizedValue) { // Logarithmic: 0.01s to 5.0s
        const minLog = Math.log10(0.01); const maxLog = Math.log10(5.0);
        return Math.pow(10, minLog + normalizedValue * (maxLog - minLog));
    }
    // XY Pad mappings remain the same
    function mapXYPadToNote(xValue) {
        const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];
        const index = Math.floor(xValue * notes.length);
        return notes[Math.min(index, notes.length - 1)];
    }
    function mapXYPadToFilterFreq(yValue) { // Logarithmic: 20Hz to 15kHz
        const minLog = Math.log10(20); const maxLog = Math.log10(15000);
        return Math.pow(10, minLog + (1.0 - yValue) * (maxLog - minLog)); // Inverted Y
    }
    function mapXYPadToReverbWet(yValue) { // Linear: 0.0 to 0.9
        return Math.max(0, Math.min(0.9, (1.0 - yValue) * 0.9)); // Inverted Y
    }

    // --- UI Interaction Setup ---

    function setupSliderInteractions() {
        const sliders = document.querySelectorAll('.styled-slider');
        sliders.forEach(slider => {
            // Set initial visual state for track fill
            updateSliderVisual(slider, uiState.params[slider.id] ?? 0.5);

            slider.addEventListener('input', (e) => {
                 if (!soundModule) return;
                 const sliderElement = e.target;
                 const rawValue = parseFloat(sliderElement.value);
                 const min = parseFloat(sliderElement.min);
                 const max = parseFloat(sliderElement.max);
                 const normalizedValue = (rawValue - min) / (max - min);

                 uiState.params[sliderElement.id] = normalizedValue; // Update central UI state
                 updateSliderVisual(sliderElement, normalizedValue); // Update visuals (value & track fill)

                 // Map and Send Updates ONLY to SoundModule
                 let mappedValue;
                 switch(sliderElement.id) {
                     case 'slider-filter':
                         mappedValue = mapSliderToFilterFreq(normalizedValue);
                         soundModule.setParameter('filter', 'frequency', mappedValue);
                         break;
                     case 'slider-resonance':
                         mappedValue = mapSliderToResonance(normalizedValue);
                         soundModule.setParameter('filter', 'Q', mappedValue);
                         break;
                     case 'slider-attack':
                          mappedValue = mapSliderToAttack(normalizedValue);
                          soundModule.setParameter('envelope', 'attack', mappedValue);
                          break;
                     case 'slider-release':
                         mappedValue = mapSliderToRelease(normalizedValue);
                         soundModule.setParameter('envelope', 'release', mappedValue);
                         break;
                 }
            });

             // Optional: Add focus/blur styling if desired
             slider.addEventListener('focus', () => slider.closest('.slider-wrapper')?.classList.add('focused'));
             slider.addEventListener('blur', () => slider.closest('.slider-wrapper')?.classList.remove('focused'));
        });
        console.log("Slider interactions setup.");
    }

    function setupXYPadInteraction() {
        const xyPad = document.getElementById('xy-pad');
        const xyPadModule = document.getElementById('xy-pad-module');
        if (!xyPad || !xyPadModule) { console.warn("XY Pad elements not found."); return; }

        let isDraggingPad = false;
        let currentNote = null;

        const updateXYPadState = (clientX, clientY, isEnding = false) => {
            if (!soundModule || !xyPadModule.offsetParent) return; // Check if module is visible
            const rect = xyPad.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

            uiState.xyPad.x = x;
            uiState.xyPad.y = y;
            updateXYPadVisual(x, y);

            const filterFreq = mapXYPadToFilterFreq(y);
            const reverbWet = mapXYPadToReverbWet(y);
            soundModule.setParameter('filter', 'frequency', filterFreq);
            soundModule.setParameter('effects.reverb', 'wet', reverbWet);

            const newNote = mapXYPadToNote(x);

            if (newNote !== currentNote && !isEnding && isDraggingPad) {
                currentNote = newNote;
                uiState.activeNoteSource = 'xy-pad';
                soundModule.startNote(currentNote);
            }
        };

        const handleXYMouseMove = (e) => {
            if (!isDraggingPad) return;
            const touch = e.touches?.[0];
            updateXYPadState(e.clientX ?? touch?.clientX, e.clientY ?? touch?.clientY);
        };

        const handleXYMouseUp = (e) => {
            if (isDraggingPad) {
                isDraggingPad = false;
                xyPad.classList.remove('active', 'touched');
                uiState.xyPad.active = false;
                if (uiState.activeNoteSource === 'xy-pad') {
                    soundModule.stopNote();
                    uiState.activeNoteSource = null;
                    currentNote = null;
                }
                document.removeEventListener('mousemove', handleXYMouseMove);
                document.removeEventListener('mouseup', handleXYMouseUp);
                document.removeEventListener('touchmove', handleXYMouseMove);
                document.removeEventListener('touchend', handleXYMouseUp);
                if (mainVisualizerCore) {
                   mainVisualizerCore.updateParameters({ xyPadActive: 0.0 });
                }
            }
        };

        const handleXYMouseDown = (e) => {
             e.preventDefault();
             if (isDraggingPad || !xyPadModule.offsetParent) return; // Ignore if hidden
             isDraggingPad = true;
             xyPad.classList.add('active');
             if (e.type === 'touchstart') xyPad.classList.add('touched');
             uiState.xyPad.active = true;

             const touch = e.touches?.[0];
             updateXYPadState(e.clientX ?? touch?.clientX, e.clientY ?? touch?.clientY);
             currentNote = mapXYPadToNote(uiState.xyPad.x);
             uiState.activeNoteSource = 'xy-pad';
             soundModule.startNote(currentNote);

             document.addEventListener('mousemove', handleXYMouseMove);
             document.addEventListener('mouseup', handleXYMouseUp);
             document.addEventListener('touchmove', handleXYMouseMove, { passive: false });
             document.addEventListener('touchend', handleXYMouseUp);

              if (mainVisualizerCore) {
                 mainVisualizerCore.updateParameters({ xyPadActive: 1.0 });
              }
        };

        xyPad.addEventListener('mousedown', handleXYMouseDown);
        xyPad.addEventListener('touchstart', handleXYMouseDown, { passive: false });
        console.log("XY Pad interactions setup.");
    }

    function setupToggleInteractions() {
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                if (!soundModule) return;
                const isChecked = e.target.checked;
                const toggleId = toggle.id;
                const effectName = toggleId.replace('toggle-', '');

                uiState.toggles[toggleId] = isChecked;

                if (effectName === 'glitch') {
                    uiState.glitchEnabled = isChecked;
                    console.log(`Glitch effect potential ${isChecked ? 'ENABLED' : 'DISABLED'}`);
                } else {
                    soundModule.toggleEffect(effectName, isChecked);
                    console.log(`Toggle ${effectName} -> ${isChecked}`);
                }
            });
        });
         console.log("Toggle interactions setup.");
    }

    function setupKeyboardInteractions() {
        const keys = document.querySelectorAll('.keyboard-key');
        const keyboardModule = document.getElementById('keyboard-module');
        if (keys.length === 0 || !keyboardModule) { console.warn("Keyboard elements not found."); return; }

        keys.forEach(key => {
            const note = key.dataset.note;
            if (!note) return;
            const overlay = key.querySelector('.key-overlay');
            if (!overlay) return;

            let releaseAnimationListener = null;

            const handleKeyDown = (e) => {
                e.preventDefault();
                // Check if keyboard module is visible before handling input
                 if (!keyboardModule.offsetParent || key.classList.contains('key-pressed') || key.classList.contains('active')) return;

                uiState.activeNoteSource = 'keyboard';
                if (soundModule) soundModule.startNote(note);

                const rect = key.getBoundingClientRect();
                let pressX, pressY;
                 if (e.touches && e.touches.length > 0) {
                     pressX = e.touches[0].clientX - rect.left; pressY = e.touches[0].clientY - rect.top;
                 } else if (e.clientX !== undefined) {
                     pressX = e.clientX - rect.left; pressY = e.clientY - rect.top;
                 } else { pressX = rect.width / 2; pressY = rect.height / 2; }

                overlay.style.setProperty('--key-press-x', `${(pressX / rect.width) * 100}%`);
                overlay.style.setProperty('--key-press-y', `${(pressY / rect.height) * 100}%`);

                overlay.style.animation = 'none';
                key.classList.remove('key-released');
                if (releaseAnimationListener) { overlay.removeEventListener('animationend', releaseAnimationListener); releaseAnimationListener = null; }
                void overlay.offsetWidth;
                overlay.style.animation = 'overlay-press 0.1s ease-out forwards';
                key.classList.add('key-pressed', 'active');
            };

            const handleKeyUp = (e) => {
                 e.preventDefault();
                 // Check if keyboard module is visible
                 if (!keyboardModule.offsetParent || !key.classList.contains('active')) return;

                if (soundModule && uiState.activeNoteSource === 'keyboard') {
                    soundModule.stopNote();
                    uiState.activeNoteSource = null;
                }

                key.classList.remove('key-pressed');
                key.classList.add('key-released');
                overlay.style.animation = 'none';
                void overlay.offsetWidth;
                overlay.style.animation = 'overlay-release 0.4s ease-out forwards';
                key.classList.remove('active');

                releaseAnimationListener = () => { key.classList.remove('key-released'); releaseAnimationListener = null; };
                overlay.addEventListener('animationend', releaseAnimationListener, { once: true });
            };

            // Mouse Events
            key.addEventListener('mousedown', handleKeyDown);
            key.addEventListener('mouseup', handleKeyUp);
            key.addEventListener('mouseleave', (e) => {
                if (e.buttons === 1 && key.classList.contains('active') && keyboardModule.offsetParent) { handleKeyUp(e); }
            });
            // Touch Events
             key.addEventListener('touchstart', handleKeyDown, { passive: false });
             key.addEventListener('touchend', handleKeyUp);
             key.addEventListener('touchcancel', handleKeyUp);
        });
        console.log("Keyboard interactions setup.");
    }

    function setupInputSwap() {
        const swapButton = document.getElementById('input-swap-button');
        const inputContainer = document.getElementById('input-container');
        const keyboardModule = document.getElementById('keyboard-module');
        const xyPadModule = document.getElementById('xy-pad-module');

        if (!swapButton || !inputContainer || !keyboardModule || !xyPadModule) {
            console.warn("Input swap elements not found."); return;
        }

        swapButton.addEventListener('click', () => {
            const currentMode = inputContainer.dataset.activeInput;
            const nextMode = currentMode === 'keyboard' ? 'xy' : 'keyboard';

            console.log(`Swapping input mode from ${currentMode} to ${nextMode}`);

            // Stop any active note from the *current* module before swapping
            if (soundModule) {
                if (currentMode === 'keyboard' && uiState.activeNoteSource === 'keyboard') {
                    soundModule.stopNote(false); // Stop immediately
                    document.querySelectorAll('.keyboard-key.active').forEach(k => k.classList.remove('active', 'key-pressed', 'key-released'));
                } else if (currentMode === 'xy' && uiState.activeNoteSource === 'xy-pad') {
                    soundModule.stopNote(false); // Stop immediately
                    document.getElementById('xy-pad')?.classList.remove('active', 'touched');
                    uiState.xyPad.active = false;
                    if (mainVisualizerCore) mainVisualizerCore.updateParameters({ xyPadActive: 0.0 });
                }
                uiState.activeNoteSource = null; // Clear source after stopping
            }

            // Update container state
            inputContainer.dataset.activeInput = nextMode;
            uiState.activeInputMode = nextMode;

            // Update button text
            swapButton.textContent = `MODE: ${nextMode === 'keyboard' ? 'KYBD' : ' XY '}`;

            // Manage focusability
            if (nextMode === 'keyboard') {
                keyboardModule.tabIndex = 0;
                xyPadModule.tabIndex = -1;
                 // Optionally focus the newly shown module
                 // keyboardModule.focus();
            } else {
                keyboardModule.tabIndex = -1;
                xyPadModule.tabIndex = 0;
                 // Optionally focus the newly shown module
                 // xyPadModule.focus();
            }
        });
         console.log("Input swap interaction setup.");
    }

     function setupModuleFocus() {
        const modules = document.querySelectorAll('.control-module:not(.sub-module), .sub-module'); // Target top-level and sub-modules
        const controlsArea = document.getElementById('controls-grid');
        const inputContainer = document.getElementById('input-container');

        modules.forEach(module => {
            // Only allow focus if the module is visible (part of the DOM tree and not display:none)
            const isFocusable = () => module.offsetParent !== null;

            module.addEventListener('focus', () => {
                if (!isFocusable() || uiState.focusedModuleId === module.id) return;

                // Remove focus class from previous module
                if (uiState.focusedModuleId) {
                    document.getElementById(uiState.focusedModuleId)?.classList.remove('focused');
                }

                // Add focus class to current module
                module.classList.add('focused');
                // Add focus class to the main container as well for overall effect
                 if (!inputContainer.contains(module)) { // Apply to main grid if not focusing within input container
                    controlsArea.classList.add('module-focused');
                 }

                uiState.focusedModuleId = module.id;
                // console.log('Focused:', module.id);
            });

            module.addEventListener('blur', () => {
                // Use timeout to allow focus to shift to another module within the controls area
                setTimeout(() => {
                    const newlyFocusedElement = document.activeElement;
                     // Check if focus is still within ANY control module OR the input container itself
                     const focusStillInsideControls = controlsArea.contains(newlyFocusedElement) || inputContainer === newlyFocusedElement;

                    if (!focusStillInsideControls && uiState.focusedModuleId === module.id) {
                        module.classList.remove('focused');
                        controlsArea.classList.remove('module-focused'); // Remove grid class only if focus leaves entirely
                        uiState.focusedModuleId = null;
                        // console.log('Blurred:', module.id);
                    } else if (focusStillInsideControls && newlyFocusedElement !== module && uiState.focusedModuleId === module.id) {
                         // Focus moved to another module, remove class from this one,
                         // but keep the main grid focused class if the new focus is not inside the input container
                         module.classList.remove('focused');
                         if (!inputContainer.contains(newlyFocusedElement)) {
                             controlsArea.classList.add('module-focused');
                         } else {
                              controlsArea.classList.remove('module-focused');
                         }
                         // The new module's focus handler will set uiState.focusedModuleId
                    } else if (!focusStillInsideControls) {
                         // Focus left controls area entirely
                         controlsArea.classList.remove('module-focused');
                         if(uiState.focusedModuleId) document.getElementById(uiState.focusedModuleId)?.classList.remove('focused');
                         uiState.focusedModuleId = null;
                    }
                }, 0);
            });
        });
        console.log("Module focus interactions setup.");
    }

    function setupPresetSelector() {
        const presetContainer = document.getElementById('preset-area'); // Use existing div
        if (!presetContainer) { console.warn("Preset container div not found."); return; }

        const label = document.createElement('label');
        label.htmlFor = 'preset-selector';
        label.textContent = 'SCROLLS:';
        label.className = 'preset-label';

        const select = document.createElement('select');
        select.id = 'preset-selector';
        select.className = 'preset-select';

        if (soundModule && soundModule.getPresetNames) {
            const presetNames = soundModule.getPresetNames();
            presetNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name.replace(/_/g, ' ').toUpperCase();
                if (name === uiState.currentPreset) option.selected = true;
                select.appendChild(option);
            });
        } else {
             console.warn("Sound module or getPresetNames not available for selector.");
             const defaultOption = document.createElement('option');
             defaultOption.textContent = "PRESETS UNAVAILABLE";
             defaultOption.disabled = true;
             select.appendChild(defaultOption);
        }

        select.addEventListener('change', (e) => {
            const newPresetName = e.target.value;
            console.log(`Loading Preset: ${newPresetName}`);
            uiState.currentPreset = newPresetName;
            if (soundModule) {
                 soundModule.applyPresetAudio(newPresetName);
                 updateUIFromSoundModuleState();
            }
        });

        presetContainer.appendChild(label);
        presetContainer.appendChild(select);
        console.log("Preset selector setup.");
    }


    // --- Audio to Visual Mapping Core Logic ---

    function mapSoundToVisuals(soundParams, audioLevels) {
        const visuals = {};
        const effects = soundParams.effects || {};
        const envelope = soundParams.envelope || {};
        const filter = soundParams.filter || {};
        const arp = effects.arpeggiator || {};
        const { bass, mid, high } = audioLevels;

        // Map to uniforms used by the adapted shader
        visuals.morphFactor = clamp(0.1 + (filter.Q / 15.0) * 0.6 + (envelope.attack / 2.0) * 0.3 + mid * 0.2, 0.0, 1.0);
        visuals.glitchIntensity = uiState.glitchEnabled ? clamp(0.05 + high * 0.6 + (filter.Q / 10.0) * 0.3, 0.0, 1.0) : 0.0;
        visuals.rotationSpeed = clamp(0.1 + mid * 0.5 + high * 0.3 + (arp.active ? arp.rate * 0.04 : 0), 0.0, 2.0);
        visuals.dimension = clamp(3.0 + bass * 0.8 + (envelope.release / 3.0) * 0.5, 3.0, 4.0);
        visuals.gridDensity = clamp(8.0 + bass * 8.0 - mid * 2.0, 5.0, 20.0);

        // Projection method based on effects
        const delayActive = effects.delay?.active;
        const reverbActive = effects.reverb?.active;
        const highFeedback = effects.delay?.feedback > 0.65;
        const highWet = effects.reverb?.wet > 0.75;
        if (delayActive && highFeedback) visuals.projectionMethod = 'stereographic';
        else if (reverbActive && highWet) visuals.projectionMethod = 'perspective';
        else if (arp.active) visuals.projectionMethod = 'stereographic';
        else visuals.projectionMethod = 'orthographic';

        visuals.xyPadActive = uiState.xyPad.active ? 1.0 : 0.0;
        visuals.currentNoteFrequency = audioLevels.frequency || 440.0; // Pass last frequency

        return visuals;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    // --- Main Update Loop ---
     function mainLoop() {
        if (!soundModule || !soundModule.audioState.isInitialized || !mainVisualizerCore || !mainVisualizerCore.state.isRendering) {
             mainLoopId = requestAnimationFrame(mainLoop);
             return;
        }

        const levels = soundModule.getAudioLevels();
        audioAnalysisState.bass = levels.bass;
        audioAnalysisState.mid = levels.mid;
        audioAnalysisState.high = levels.high;
        audioAnalysisState.frequency = levels.frequency;

        const soundParams = soundModule.audioState.parameters;
        const visualParams = mapSoundToVisuals(soundParams, audioAnalysisState);
        mainVisualizerCore.updateParameters(visualParams);

        mainLoopId = requestAnimationFrame(mainLoop);
    }

    function startMainLoop() {
         if (mainLoopId) { cancelAnimationFrame(mainLoopId); }
         console.log("Starting main audio/visual loop (v1.2).");
         mainLoop();
     }

     function stopMainLoop() {
          if (mainLoopId) { cancelAnimationFrame(mainLoopId); mainLoopId = null; }
          console.log("Stopped main audio/visual loop.");
     }

    // --- Cleanup ---
     function cleanup() {
        console.log("Cleaning up UI interactions and modules (v1.2)...");
        stopMainLoop();
        if (mainVisualizerCore) mainVisualizerCore.dispose();
        if (soundModule) soundModule.dispose();
        mainVisualizerCore = null; shaderManager = null; geometryManager = null; projectionManager = null; soundModule = null;
        window.mainVisualizerCore = null;
        console.log("Cleanup complete.");
    }
    window.addEventListener('beforeunload', cleanup);


    // --- Run Initialization Steps ---
    async function runInitialization() {
        console.log("Initialization sequence started (v1.2)...");
        if (!initializeManagers()) { console.error("Failed managers init."); return; }
        if (!initializeMainVisualizer()) { console.error("Failed visualizer init."); return; }

        // Setup UI interactions BEFORE sound init (except preset selector)
        setupSliderInteractions(); // Setup sliders
        setupXYPadInteraction();
        setupToggleInteractions();
        setupKeyboardInteractions();
        setupInputSwap(); // Setup swap mechanism
        setupModuleFocus();
        console.log("UI Interactions Initialized.");

        // Initialize sound module (requires user interaction)
        if (await initializeSoundModule()) {
            setupPresetSelector(); // Setup presets now that soundModule exists
            mainVisualizerCore.start();
            startMainLoop();
        } else {
            setupPresetSelector(); // Still setup selector (shows error)
            console.warn("Sound module failed. Starting visualizer without audio reactivity.");
            mainVisualizerCore.start();
            startMainLoop(); // Start loop anyway, audioLevels will be 0
        }
        console.log("Initialization sequence finished.");
    }

    runInitialization();

}); // End DOMContentLoaded