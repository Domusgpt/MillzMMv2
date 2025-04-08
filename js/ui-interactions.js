/* Enhanced UI Interactions for MELODIOUS MALEFICARUM v1.2 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM Loaded - Initializing Enhanced MALEFICARUM v1.2...");
  
  // --- Module Instances Reference --- //
  let mainVisualizerCore = null;  // Reference to existing HypercubeCore
  let soundModule = null;        // Reference to SoundModule
  
  // --- State --- //
  const uiState = {
    params: {
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
    visualizerAsPad: false, // Flag for visualizer-as-input mode
    activeInputMode: 'keyboard', // 'keyboard' or 'xy'
    activeNoteSource: null,
    currentPreset: 'vaporwave',
    focusedModuleId: null,
    particleSystem: {
      active: true,
      particles: [],
      maxParticles: 15
    }
  };
  
  // Store audio analysis data for particle system
  const audioAnalysisState = {
    bass: 0, mid: 0, high: 0, frequency: 440.0
  };
  
  // --- Enhanced Feature Setup --- //
  
  /**
   * Sets up enhanced module focus interactions beyond basic focus/blur
   * Implements dramatic morphing of UI elements when focused
   */
  function setupEnhancedModuleFocus() {
    const modules = document.querySelectorAll('.control-module:not(.sub-module), .sub-module');
    const controlsArea = document.getElementById('controls-grid');
    
    modules.forEach(module => {
      const isFocusable = () => module.offsetParent !== null;
      
      module.addEventListener('click', (e) => {
        if (!isFocusable() || uiState.focusedModuleId === module.id) return;
        
        // Remove focus from previous module
        if (uiState.focusedModuleId) {
          document.getElementById(uiState.focusedModuleId)?.classList.remove('focused');
        }
        
        // Add focus to clicked module
        module.classList.add('focused');
        controlsArea.classList.add('has-focus');
        uiState.focusedModuleId = module.id;
        
        // Prevent event bubbling
        e.stopPropagation();
      });
    });
    
    // Click outside modules to clear focus
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.control-module') && uiState.focusedModuleId) {
        document.getElementById(uiState.focusedModuleId)?.classList.remove('focused');
        controlsArea.classList.remove('has-focus');
        uiState.focusedModuleId = null;
      }
    });
    
    console.log("Enhanced module focus interactions set up");
  }
  
  /**
   * Sets up visualizer area as interactive XY pad
   * When active, movements within visualizer control sound parameters
   */
  function setupVisualizerAsInput() {
    const visualizerArea = document.querySelector('.visualizer-area');
    
    if (!visualizerArea) {
      console.warn("Visualizer area not found");
      return;
    }
    
    // Track interaction state
    let isVisualizerInteracting = false;
    let visualizerNoteActive = false;
    let visualizerOctave = 4; // Default octave
    
    // Add visual indicator for XY position
    const indicator = document.createElement('div');
    indicator.className = 'visualizer-xy-indicator';
    indicator.style.cssText = `
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(138, 127, 255, 0.9) 0%, rgba(138, 127, 255, 0) 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      z-index: 10;
      box-shadow: 0 0 15px rgba(138, 127, 255, 0.8);
      transition: opacity 0.3s ease;
    `;
    visualizerArea.appendChild(indicator);
    
    // Handle interaction start
    visualizerArea.addEventListener('mousedown', (e) => {
      if (uiState.focusedModuleId || !uiState.visualizerAsPad) return;
      
      isVisualizerInteracting = true;
      visualizerArea.classList.add('active');
      handleVisualizerInteraction(e);
      
      // Show indicator
      indicator.style.opacity = '1';
      
      // Create initial particle burst
      if (uiState.particleSystem.active) {
        createParticleBurst(e.clientX, e.clientY, 5);
      }
    });
    
    // Handle interaction movement
    document.addEventListener('mousemove', (e) => {
      if (!isVisualizerInteracting) return;
      handleVisualizerInteraction(e);
    });
    
    // Handle interaction end
    document.addEventListener('mouseup', () => {
      if (!isVisualizerInteracting) return;
      
      isVisualizerInteracting = false;
      visualizerArea.classList.remove('active');
      
      // Hide indicator with delay
      setTimeout(() => {
        indicator.style.opacity = '0';
      }, 300);
      
      // Stop note if active
      if (visualizerNoteActive && soundModule) {
        soundModule.stopNote();
        visualizerNoteActive = false;
      }
    });
    
    // Handle visualizer interaction
    function handleVisualizerInteraction(e) {
      const rect = visualizerArea.getBoundingClientRect();
      
      // Calculate relative position (0-1)
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      // Position indicator
      indicator.style.left = `${e.clientX - rect.left}px`;
      indicator.style.top = `${e.clientY - rect.top}px`;
      
      // Get currently highlighted module (if any)
      const highlightedModule = uiState.focusedModuleId ? 
        document.getElementById(uiState.focusedModuleId) : null;
      
      if (!highlightedModule) {
        // No focused module - use X for note selection, Y for filter
        if (soundModule) {
          // Map X to note (12 notes in octave)
          const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteIndex = Math.floor(x * 12);
          const note = `${notes[noteIndex]}${visualizerOctave}`;
          
          // Map Y to filter frequency (inverted)
          const filterFreq = mapRangeExp(1 - y, 0, 1, 100, 10000);
          soundModule.setParameter('filter', 'frequency', filterFreq);
          
          // If not already playing, start note
          if (!visualizerNoteActive) {
            soundModule.startNote(note);
            visualizerNoteActive = true;
          }
          
          // Update visualizer parameters
          if (mainVisualizerCore) {
            mainVisualizerCore.updateParameters({
              gridDensity: 5 + (1 - y) * 15, // More density at top
              morphFactor: x, // Morph factor based on X
            });
          }
        }
      } else if (highlightedModule.classList.contains('params-effects-module')) {
        // Params module focused - manipulate sliders directly
        const sliderFilter = document.getElementById('slider-filter');
        const sliderResonance = document.getElementById('slider-resonance');
        
        if (sliderFilter && sliderResonance) {
          // Update filter (X axis)
          const filterValue = Math.floor(x * 1000);
          sliderFilter.value = filterValue;
          updateSliderVisual(sliderFilter, x);
          uiState.params['slider-filter'] = x;
          
          // Update resonance (Y axis - inverted)
          const resonanceValue = Math.floor((1 - y) * 1000);
          sliderResonance.value = resonanceValue;
          updateSliderVisual(sliderResonance, 1 - y);
          uiState.params['slider-resonance'] = 1 - y;
          
          // Dispatch change events to trigger parameter updates
          sliderFilter.dispatchEvent(new Event('input'));
          sliderResonance.dispatchEvent(new Event('input'));
        }
      }
      
      // Create particles while dragging
      if (uiState.particleSystem.active && Math.random() > 0.7) {
        createParticle(e.clientX, e.clientY);
      }
    }
    
    // Handle double-click to toggle visualizer as pad mode
    visualizerArea.addEventListener('dblclick', () => {
      uiState.visualizerAsPad = !uiState.visualizerAsPad;
      visualizerArea.classList.toggle('interactive', uiState.visualizerAsPad);
      console.log(`Visualizer as pad mode: ${uiState.visualizerAsPad ? 'ON' : 'OFF'}`);
      
      // Show help tooltip
      showTooltip(
        uiState.visualizerAsPad ? 
          'Visualizer as XY pad mode activated! Click and drag to control sound.' : 
          'Visualizer as XY pad mode deactivated.'
      );
    });
    
    // Handle wheel for octave change
    visualizerArea.addEventListener('wheel', (e) => {
      if (!uiState.visualizerAsPad) return;
      
      e.preventDefault();
      
      // Change octave based on wheel direction
      if (e.deltaY < 0) {
        visualizerOctave = Math.min(8, visualizerOctave + 1); // Up
      } else {
        visualizerOctave = Math.max(1, visualizerOctave - 1); // Down
      }
      
      // Show octave change tooltip
      showTooltip(`Octave: ${visualizerOctave}`);
      
      // Create particle burst on octave change
      createParticleBurst(e.clientX, e.clientY, 10);
    });
    
    console.log("Visualizer as input functionality set up");
  }
  
  /**
   * Creates enhanced preset selector with wheel/dial interface
   */
  function setupEnhancedPresetSelector() {
    const presetContainer = document.getElementById('preset-area');
    if (!presetContainer || !soundModule) return;
    
    // Clear existing content
    presetContainer.innerHTML = '';
    
    // Create wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'preset-wheel-container';
    
    // Create wheel
    const wheel = document.createElement('div');
    wheel.className = 'preset-wheel';
    
    // Get presets
    const presetNames = soundModule.getPresetNames();
    
    // Create preset items
    presetNames.forEach(name => {
      const item = document.createElement('div');
      item.className = 'preset-wheel-item';
      item.textContent = name.replace(/_/g, ' ').toUpperCase();
      item.dataset.preset = name;
      
      if (name === uiState.currentPreset) {
        item.classList.add('active');
      }
      
      item.addEventListener('click', () => {
        // Remove active class from all items
        wheel.querySelectorAll('.preset-wheel-item').forEach(el => {
          el.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Set preset
        uiState.currentPreset = name;
        soundModule.applyPresetAudio(name);
        updateUIFromSoundModuleState();
        
        // Create particle burst
        if (uiState.particleSystem.active) {
          const rect = item.getBoundingClientRect();
          createParticleBurst(
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            15
          );
        }
      });
      
      wheel.appendChild(item);
    });
    
    // Add wheel to container
    wheelContainer.appendChild(wheel);
    presetContainer.appendChild(wheelContainer);
    
    // Set up wheel drag functionality
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    
    wheel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - wheel.offsetLeft;
      scrollLeft = wheel.scrollLeft;
      wheel.style.cursor = 'grabbing';
    });
    
    wheel.addEventListener('mouseleave', () => {
      isDragging = false;
      wheel.style.cursor = 'grab';
    });
    
    wheel.addEventListener('mouseup', () => {
      isDragging = false;
      wheel.style.cursor = 'grab';
    });
    
    wheel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.pageX - wheel.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      wheel.scrollLeft = scrollLeft - walk;
    });
    
    console.log("Enhanced preset selector set up");
  }
  
  /**
   * Sets up particle system for visual feedback
   */
  function setupParticleSystem() {
    // Create container for particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    // Function to create a single particle
    window.createParticle = (x, y, size = null, color = null) => {
      if (!uiState.particleSystem.active) return;
      
      // Limit number of particles
      if (uiState.particleSystem.particles.length >= uiState.particleSystem.maxParticles) {
        const oldestParticle = uiState.particleSystem.particles.shift();
        oldestParticle.remove();
      }
      
      // Create particle element
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Randomize particle properties
      const particleSize = size || 10 + Math.random() * 20; // 10-30px
      const duration = 1 + Math.random() * 3; // 1-4s
      
      // Use audio analysis to influence particles
      const bassInfluence = audioAnalysisState.bass || 0;
      const highInfluence = audioAnalysisState.high || 0;
      
      // Determine color based on parameter or audio
      let particleColor;
      if (color) {
        particleColor = color;
      } else if (highInfluence > 0.6) {
        particleColor = 'rgba(255, 0, 255, 0.8)'; // Magenta for high frequencies
      } else if (bassInfluence > 0.6) {
        particleColor = 'rgba(0, 240, 255, 0.8)'; // Cyan for bass
      } else {
        particleColor = 'rgba(138, 127, 255, 0.8)'; // Default accent
      }
      
      // Set particle properties
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background: radial-gradient(circle, ${particleColor} 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transform: translate(-50%, -50%);
        animation: particleFade ${duration}s ease-out forwards;
      `;
      
      // Add drift animation with CSS variables
      const angle = Math.random() * Math.PI * 2; // Random angle
      const distance = 50 + Math.random() * 100; // Random distance 50-150px
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      
      particle.style.setProperty('--move-x', `${moveX}px`);
      particle.style.setProperty('--move-y', `${moveY}px`);
      
      // Define the animation keyframes dynamically
      const stylesheet = document.styleSheets[0];
      const keyframesRule = `
        @keyframes particleFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
          10% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--move-x)), calc(-50% + var(--move-y))) scale(1.5); }
        }
      `;
      
      // Add keyframes if not already added
      try {
        if (!document.querySelector('style#particle-keyframes')) {
          const styleEl = document.createElement('style');
          styleEl.id = 'particle-keyframes';
          styleEl.textContent = keyframesRule;
          document.head.appendChild(styleEl);
        }
      } catch (e) {
        console.warn('Could not add particle keyframes:', e);
      }
      
      // Add particle to DOM
      particleContainer.appendChild(particle);
      
      // Store particle reference
      uiState.particleSystem.particles.push(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
          // Remove from tracking array
          const index = uiState.particleSystem.particles.indexOf(particle);
          if (index > -1) {
            uiState.particleSystem.particles.splice(index, 1);
          }
        }
      }, duration * 1000);
    };
    
    // Function to create a burst of particles
    window.createParticleBurst = (x, y, count = 5) => {
      if (!uiState.particleSystem.active) return;
      
      // Create multiple particles around a point
      for (let i = 0; i < count; i++) {
        // Add some randomness to position
        const offsetX = x + (Math.random() - 0.5) * 40;
        const offsetY = y + (Math.random() - 0.5) * 40;
        
        // Create particle with slight delay
        setTimeout(() => {
          createParticle(offsetX, offsetY);
        }, i * 50); // Stagger creation
      }
    };
    
    console.log("Particle system initialized");
  }
  
  /**
   * Enhanced mode switch with improved visuals and animation
   */
  function setupEnhancedInputModeSwitch() {
    const swapButton = document.getElementById('input-swap-button');
    const inputContainer = document.getElementById('input-container');
    
    if (!swapButton || !inputContainer) {
      console.warn("Input swap elements not found");
      return;
    }
    
    // Convert to enhanced button
    swapButton.className = 'mode-switch-button';
    swapButton.innerHTML = `
      <span class="mode-indicator">MODE: KYBD</span>
      <div class="switch-track">
        <div class="switch-handle"></div>
      </div>
    `;
    
    // Update button state
    const updateSwitchState = (mode) => {
      swapButton.className = `mode-switch-button ${mode}`;
      swapButton.querySelector('.mode-indicator').textContent = `MODE: ${mode === 'keyboard' ? 'KYBD' : 'XY'}`;
    };
    
    swapButton.addEventListener('click', () => {
      const currentMode = inputContainer.dataset.activeInput;
      const nextMode = currentMode === 'keyboard' ? 'xy' : 'keyboard';
      
      console.log(`Swapping input mode from ${currentMode} to ${nextMode}`);
      
      // Stop active note
      if (soundModule) {
        if (currentMode === 'keyboard' && uiState.activeNoteSource === 'keyboard') {
          soundModule.stopNote(false);
          // Clear visual state of keys
          document.querySelectorAll('.keyboard-key.active').forEach(k => 
            k.classList.remove('active', 'key-pressed', 'key-released')
          );
        } else if (currentMode === 'xy' && uiState.activeNoteSource === 'xy-pad') {
          soundModule.stopNote(false);
          // Clear XY pad visual state
          document.getElementById('xy-pad')?.classList.remove('active', 'touched');
          uiState.xyPad.active = false;
        }
        uiState.activeNoteSource = null;
      }
      
      // Update container state
      inputContainer.dataset.activeInput = nextMode;
      uiState.activeInputMode = nextMode;
      
      // Update switch visual
      updateSwitchState(nextMode);
      
      // Add animation
      inputContainer.classList.add('switching');
      setTimeout(() => {
        inputContainer.classList.remove('switching');
      }, 500);
      
      // Create particle burst at switch
      if (uiState.particleSystem.active) {
        const rect = swapButton.getBoundingClientRect();
        createParticleBurst(
          rect.left + rect.width / 2, 
          rect.top + rect.height / 2, 
          8
        );
      }
      
      // Show tooltip
      showTooltip(`Mode switched to ${nextMode === 'keyboard' ? 'Keyboard' : 'XY Pad'}`);
    });
    
    // Set initial state
    updateSwitchState(uiState.activeInputMode);
    
    console.log("Enhanced input mode switch setup");
  }
  
  /**
   * Displays a temporary tooltip with message
   */
  function showTooltip(message, duration = 2000) {
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.maleficarum-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'maleficarum-tooltip';
    tooltip.textContent = message;
    
    // Style tooltip
    tooltip.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 30, 40, 0.8);
      color: #e8ebf0;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: var(--font-ui);
      font-size: 14px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 0 10px rgba(138, 127, 255, 0.5),
                  0 0 20px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(138, 127, 255, 0.3);
      text-shadow: 0 0 5px rgba(138, 127, 255, 0.5);
    `;
    
    // Add to DOM
    document.body.appendChild(tooltip);
    
    // Animate in
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }, 300);
    }, duration);
  }
  
  // --- Helper Functions --- //
  
  /**
   * Updates slider visual track based on value
   */
  function updateSliderVisual(sliderElement, normalizedValue) {
    if (!sliderElement) return;
    
    // Update slider value (denormalize)
    const min = parseFloat(sliderElement.min);
    const max = parseFloat(sliderElement.max);
    const rawValue = Math.round(normalizedValue * (max - min) + min);
    sliderElement.value = rawValue;
    
    // Update custom track fill visual
    const wrapper = sliderElement.closest('.slider-wrapper');
    if (wrapper) {
      const progress = (rawValue - min) / (max - min);
      wrapper.style.setProperty('--slider-progress', progress.toFixed(3));
    }
  }
  
  /**
   * Maps value from one range to another with exponential scaling
   */
  function mapRangeExp(value, inMin, inMax, outMin, outMax, exponent = 2) {
    // Normalize to 0-1
    const normalized = (value - inMin) / (inMax - inMin);
    // Apply exponential curve
    const curved = Math.pow(normalized, exponent);
    // Map to output range
    return outMin + curved * (outMax - outMin);
  }
  
  // --- Integrate with Main Loop --- //
  
  /**
   * Enhanced main loop with additional visual effects
   */
  function enhancedMainLoop() {
    // Original functionality preserved
    if (!soundModule || !soundModule.audioState.isInitialized || 
        !mainVisualizerCore || !mainVisualizerCore.state.isRendering) {
      requestAnimationFrame(enhancedMainLoop);
      return;
    }
    
    // Get audio levels
    const levels = soundModule.getAudioLevels();
    audioAnalysisState.bass = levels.bass;
    audioAnalysisState.mid = levels.mid;
    audioAnalysisState.high = levels.high;
    audioAnalysisState.frequency = levels.frequency;
    
    // Get sound parameters
    const soundParams = soundModule.audioState.parameters;
    
    // Map parameters for visualization (preserving original mapping)
    const visualParams = mapSoundToVisuals(soundParams, audioAnalysisState);
    
    // Update visualizer
    mainVisualizerCore.updateParameters(visualParams);
    
    // Continue loop
    requestAnimationFrame(enhancedMainLoop);
  }
  
  // --- Initialize Enhanced Features --- //
  
  /**
   * Main initialization function for enhanced features
   */
  async function initializeEnhancements() {
    console.log("Initializing MALEFICARUM enhancements...");
    
    // Get references to existing instances
    mainVisualizerCore = window.mainVisualizerCore; // Access from global
    soundModule = await getSoundModule();
    
    if (!mainVisualizerCore) {
      console.warn("Main visualizer core not found - limited functionality");
    }
    
    if (!soundModule) {
      console.warn("Sound module not found - limited functionality");
    }
    
    // Setup enhancements
    setupParticleSystem();
    setupEnhancedModuleFocus();
    setupVisualizerAsInput();
    setupEnhancedInputModeSwitch();
    
    if (soundModule) {
      setupEnhancedPresetSelector();
    }
    
    // Start enhanced main loop
    enhancedMainLoop();
    
    // Show welcome tooltip
    setTimeout(() => {
      showTooltip("Welcome to Enhanced MELODIOUS MALEFICARUM v1.2", 3000);
    }, 1000);
    
    console.log("MALEFICARUM enhancements initialized!");
  }
  
  /**
   * Helper function to get sound module reference
   */
  async function getSoundModule() {
    // Try to access existing instance
    if (window.soundModule) {
      return window.soundModule;
    }
    
    // Wait for possible initialization
    return new Promise(resolve => {
      // Check for 3 seconds
      let attempts = 0;
      const maxAttempts = 30;
      const checkInterval = 100; // ms
      
      const intervalId = setInterval(() => {
        if (window.soundModule) {
          clearInterval(intervalId);
          console.log("Sound module found");
          resolve(window.soundModule);
        } else if (++attempts >= maxAttempts) {
          clearInterval(intervalId);
          console.warn("Sound module not found after waiting");
          resolve(null);
        }
      }, checkInterval);
    });
  }
  
  // Start initialization on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements);
  } else {
    // DOM already loaded
    initializeEnhancements();
  }
});

/* 
 * CSS Injector - Add dynamic styles on the fly
 * This handles animations and transitions that need to be
 * added programmatically
 */
(function injectStyles() {
  const styleEl = document.createElement('style');
  styleEl.id = 'maleficarum-dynamic-styles';
  
  styleEl.textContent = `
    /* Visualizer As Pad Mode */
    .visualizer-area.interactive {
      cursor: crosshair;
      border-color: rgba(138, 127, 255, 0.3);
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
                  0 0 10px rgba(138, 127, 255, 0.3);
    }
    
    .visualizer-area.active {
      border-color: rgba(138, 127, 255, 0.6);
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
                  0 0 15px rgba(138, 127, 255, 0.5);
    }
    
    /* Module Container Switch Animation */
    .input-module-container.switching {
      animation: moduleSwitch 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    @keyframes moduleSwitch {
      0% { transform: scale(1) translateZ(0); opacity: 1; }
      50% { transform: scale(0.9) translateZ(-30px); opacity: 0.5; }
      100% { transform: scale(1) translateZ(0); opacity: 1; }
    }
    
    /* Module Focus Animation */
    .control-module.focused {
      animation: pulseFocus 2s ease-in-out infinite alternate;
    }
    
    @keyframes pulseFocus {
      0% { box-shadow: var(--shadow-depth), 0 0 15px var(--glow-accent); }
      100% { box-shadow: var(--shadow-depth), 0 0 22px var(--glow-accent-bright); }
    }
    
    /* Enhanced Text Effects */
    .module-title {
      position: relative;
      overflow: hidden;
    }
    
    .module-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--accent-color) 50%,
        transparent 100%
      );
      animation: scanline 3s linear infinite;
    }
    
    @keyframes scanline {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  
  // Add to document head
  if (document.head) {
    document.head.appendChild(styleEl);
  } else {
    // Fallback if head not available yet
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(styleEl);
    });
  }
})();