// enhanced-ui.js - Drop-in enhancement for MELODIOUS MALEFICARUM
// This approach avoids React completely, using vanilla JS for compatibility

document.addEventListener('DOMContentLoaded', () => {
    console.log("MELODIOUS MALEFICARUM Enhanced UI initializing...");
    
    // Initialize all enhancements
    setupReducedGlassmorphism();
    setupVisualizerAsController();
    enhanceModuleFocus();
    improveInputModeSwitch();
    setupEnhancedPresetSelector();
    setupParticleSystem();
    
    // Show welcome tooltip
    setTimeout(() => {
        showTooltip("Enhanced MELODIOUS MALEFICARUM v1.2 Active", 3000);
    }, 1000);
});

// ---- CORE ENHANCEMENTS ----

/**
 * Reduces glassmorphism effect to make the visualizer more visible
 */
function setupReducedGlassmorphism() {
    // Create a style element to add dynamic styles
    const style = document.createElement('style');
    style.textContent = `
        /* Reduce opacity of glassmorphic elements */
        .main-frame {
            background: rgba(var(--element-base-color-rgb), 0.05) !important;
            backdrop-filter: blur(2px) !important;
        }
        
        .control-module {
            background: rgba(var(--element-base-color-rgb), 0.08) !important;
            backdrop-filter: blur(1px) !important;
        }
        
        /* Enhance text for better visibility */
        .module-title {
            text-shadow: 0 0 5px var(--glow-accent-faint),
                         0 0 10px var(--glow-accent-faint),
                         0 0 15px rgba(var(--glow-magenta-rgb), 0.5),
                         2px 2px 2px rgba(0,0,0,0.7) !important;
            animation: textPulse 3s infinite alternate;
        }
        
        @keyframes textPulse {
            0% { text-shadow: 0 0 5px var(--glow-accent-faint),
                            0 0 10px var(--glow-accent-faint),
                            0 0 15px rgba(var(--glow-magenta-rgb), 0.5); }
            100% { text-shadow: 0 0 8px var(--glow-accent),
                              0 0 15px var(--glow-accent-faint),
                              0 0 20px rgba(var(--glow-magenta-rgb), 0.7); }
        }
    `;
    document.head.appendChild(style);
    console.log("Glassmorphism reduced for better visualizer visibility");
}

/**
 * Sets up visualizer area as an interactive controller
 */
function setupVisualizerAsController() {
    const visualizerArea = document.querySelector('.visualizer-area');
    if (!visualizerArea) {
        console.warn("Visualizer area not found");
        return;
    }
    
    // Add state management
    let isActive = false;
    let controlMode = 'off'; // 'off', 'xy', 'note'
    
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
    
    // Add mode toggle button
    const modeToggle = document.createElement('button');
    modeToggle.className = 'visualizer-mode-toggle';
    modeToggle.textContent = 'VIZ: OFF';
    modeToggle.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 20;
        background: rgba(var(--element-base-color-rgb), 0.3);
        color: var(--text-color-primary);
        border: 1px solid rgba(var(--accent-color-rgb), 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        font-family: var(--font-ui);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    visualizerArea.appendChild(modeToggle);
    
    // Add CSS for visualizer modes
    const style = document.createElement('style');
    style.textContent = `
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
        
        .visualizer-mode-toggle:hover {
            background: rgba(var(--element-base-color-rgb), 0.5);
            border-color: rgba(var(--accent-color-rgb), 0.6);
            box-shadow: 0 0 8px rgba(138, 127, 255, 0.5);
        }
    `;
    document.head.appendChild(style);
    
    // Toggle visualizer mode
    modeToggle.addEventListener('click', () => {
        // Cycle through modes: off -> xy -> note -> off
        switch (controlMode) {
            case 'off':
                controlMode = 'xy';
                modeToggle.textContent = 'VIZ: XY';
                visualizerArea.classList.add('interactive');
                showTooltip('Visualizer XY mode: Control filter and effects');
                break;
            case 'xy':
                controlMode = 'note';
                modeToggle.textContent = 'VIZ: NOTE';
                visualizerArea.classList.add('interactive');
                showTooltip('Visualizer Note mode: Play notes by position');
                break;
            case 'note':
                controlMode = 'off';
                modeToggle.textContent = 'VIZ: OFF';
                visualizerArea.classList.remove('interactive');
                showTooltip('Visualizer interactive mode disabled');
                break;
        }
    });
    
    // Handle interaction start
    visualizerArea.addEventListener('mousedown', (e) => {
        if (controlMode === 'off') return;
        
        isActive = true;
        visualizerArea.classList.add('active');
        handleVisualizerInteraction(e);
        
        // Show indicator
        indicator.style.opacity = '1';
        indicator.style.left = `${e.clientX - visualizerArea.getBoundingClientRect().left}px`;
        indicator.style.top = `${e.clientY - visualizerArea.getBoundingClientRect().top}px`;
        
        // Create particle effect
        if (window.createParticleBurst) {
            window.createParticleBurst(e.clientX, e.clientY, 5);
        }
    });
    
    // Handle movement
    document.addEventListener('mousemove', (e) => {
        if (!isActive) return;
        
        handleVisualizerInteraction(e);
        
        // Update indicator position
        indicator.style.left = `${e.clientX - visualizerArea.getBoundingClientRect().left}px`;
        indicator.style.top = `${e.clientY - visualizerArea.getBoundingClientRect().top}px`;
    });
    
    // Handle interaction end
    document.addEventListener('mouseup', () => {
        if (!isActive) return;
        
        isActive = false;
        visualizerArea.classList.remove('active');
        
        // Hide indicator with delay
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 300);
        
        // Stop note if in note mode
        if (controlMode === 'note' && window.soundModule) {
            window.soundModule.stopNote();
        }
    });
    
    // Handle visualizer interaction based on mode
    function handleVisualizerInteraction(e) {
        const rect = visualizerArea.getBoundingClientRect();
        
        // Calculate relative position (0-1)
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        
        if (controlMode === 'xy') {
            // In XY mode, control visualizer parameters if available
            if (window.mainVisualizerCore) {
                window.mainVisualizerCore.updateParameters({
                    morphFactor: x,
                    glitchIntensity: y > 0.7 ? (y - 0.7) * 3.33 : 0, // Only activate glitch in upper portion
                    gridDensity: 5 + y * 15, // More density at bottom
                    rotationSpeed: 0.3 + x * 0.7 // Faster rotation to the right
                });
            }
            
            // Also update sliders if we can find them
            const filterSlider = document.getElementById('slider-filter');
            const resonanceSlider = document.getElementById('slider-resonance');
            
            if (filterSlider && resonanceSlider) {
                // Map x/y to sliders and trigger events
                const filterVal = Math.floor(x * 1000);
                const resonanceVal = Math.floor((1 - y) * 1000);
                
                filterSlider.value = filterVal;
                resonanceSlider.value = resonanceVal;
                
                // Update slider visuals
                updateSliderVisual(filterSlider, x);
                updateSliderVisual(resonanceSlider, 1 - y);
                
                // Dispatch events to trigger parameter updates
                filterSlider.dispatchEvent(new Event('input'));
                resonanceSlider.dispatchEvent(new Event('input'));
            }
        } 
        else if (controlMode === 'note' && window.soundModule) {
            // In Note mode, play notes based on position
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(y * 4) + 3; // Octaves 3-6
            const noteIndex = Math.floor(x * 12);
            const note = `${notes[noteIndex]}${octave}`;
            
            // Play note (assuming soundModule has this method)
            window.soundModule.startNote(note);
        }
    }
    
    console.log("Visualizer controller setup complete");
}

/**
 * Enhances module focus with morphing effects
 */
function enhanceModuleFocus() {
    const modules = document.querySelectorAll('.control-module:not(.sub-module), .sub-module');
    const controlsArea = document.getElementById('controls-grid');
    
    if (!modules.length || !controlsArea) {
        console.warn("Control modules not found");
        return;
    }
    
    // Add CSS for enhanced module focusing
    const style = document.createElement('style');
    style.textContent = `
        /* Default state - more subtle */
        .controls-area .control-module {
            opacity: 0.85; 
            transform: scale(0.98) translateZ(-10px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Focused state */
        .controls-area .control-module.focused {
            opacity: 1;
            transform: scale(1.02) translateZ(15px);
            z-index: 10;
            box-shadow: var(--shadow-depth), 0 0 15px var(--glow-accent);
            background: rgba(var(--element-base-color-rgb), 0.25) !important;
            animation: pulseFocus 2s ease-in-out infinite alternate;
        }
        
        /* When another module has focus */
        .controls-area.has-focus .control-module:not(.focused) {
            opacity: 0.4;
            transform: scale(0.92) translateZ(-30px);
            filter: blur(1px);
        }
        
        @keyframes pulseFocus {
            0% { box-shadow: var(--shadow-depth), 0 0 15px var(--glow-accent); }
            100% { box-shadow: var(--shadow-depth), 0 0 22px var(--glow-accent-bright); }
        }
    `;
    document.head.appendChild(style);
    
    // Track focused module
    let focusedModuleId = null;
    
    // Module focus functionality
    modules.forEach(module => {
        module.addEventListener('click', (e) => {
            // Skip if this is already the focused module
            if (focusedModuleId === module.id) return;
            
            // Remove focus from all modules
            modules.forEach(m => m.classList.remove('focused'));
            
            // Add focus to clicked module
            module.classList.add('focused');
            controlsArea.classList.add('has-focus');
            focusedModuleId = module.id;
            
            // Create particle burst at module center
            if (window.createParticleBurst) {
                const rect = module.getBoundingClientRect();
                window.createParticleBurst(
                    rect.left + rect.width / 2, 
                    rect.top + rect.height / 2, 
                    8
                );
            }
            
            // Stop event bubbling to prevent body click handler from firing
            e.stopPropagation();
        });
    });
    
    // Click outside modules to clear focus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.control-module') && focusedModuleId) {
            modules.forEach(m => m.classList.remove('focused'));
            controlsArea.classList.remove('has-focus');
            focusedModuleId = null;
        }
    });
    
    console.log("Enhanced module focus effects setup complete");
}

/**
 * Improves the input mode switch with better styling and animation
 */
function improveInputModeSwitch() {
    const swapButton = document.getElementById('input-swap-button');
    const inputContainer = document.getElementById('input-container');
    
    if (!swapButton || !inputContainer) {
        console.warn("Input swap elements not found");
        return;
    }
    
    // Store original text and current mode
    const originalText = swapButton.textContent;
    const currentMode = inputContainer.dataset.activeInput || 'keyboard';
    
    // Create enhanced button
    const enhancedButton = document.createElement('button');
    enhancedButton.className = `mode-switch-button ${currentMode === 'xy' ? 'xy' : ''}`;
    enhancedButton.innerHTML = `
        <span class="mode-indicator">${originalText}</span>
        <div class="switch-track">
            <div class="switch-handle"></div>
        </div>
    `;
    
    // Add CSS for the enhanced button
    const style = document.createElement('style');
    style.textContent = `
        .mode-switch-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(145deg, #262333, #1a1727);
            border: 1px solid rgba(138, 127, 255, 0.3);
            border-radius: 5px;
            padding: 5px 10px;
            font-family: var(--font-ui);
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.5px;
            color: var(--text-color-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .mode-switch-button:hover {
            color: var(--text-color-primary);
            border-color: rgba(138, 127, 255, 0.6);
            box-shadow: 0 0 10px rgba(138, 127, 255, 0.5);
        }
        
        .mode-switch-button .switch-track {
            width: 24px;
            height: 14px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 7px;
            position: relative;
        }
        
        .mode-switch-button .switch-handle {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--accent-color);
            top: 2px;
            left: 2px;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      background-color 0.3s ease;
            box-shadow: 0 0 5px rgba(138, 127, 255, 0.5);
        }
        
        .mode-switch-button.xy .switch-handle {
            transform: translateX(10px);
            background: var(--accent-color-light);
            box-shadow: 0 0 8px var(--accent-color);
        }
        
        /* Animation for input container switching */
        .input-module-container.switching {
            animation: moduleSwitch 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes moduleSwitch {
            0% { transform: scale(1) translateZ(0); opacity: 1; }
            50% { transform: scale(0.9) translateZ(-30px); opacity: 0.5; }
            100% { transform: scale(1) translateZ(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Replace the original button
    swapButton.parentNode.replaceChild(enhancedButton, swapButton);
    
    // Handle click
    enhancedButton.addEventListener('click', () => {
        const currentMode = inputContainer.dataset.activeInput;
        const nextMode = currentMode === 'keyboard' ? 'xy' : 'keyboard';
        
        console.log(`Swapping input mode from ${currentMode} to ${nextMode}`);
        
        // Stop active note
        if (window.soundModule) {
            if (currentMode === 'keyboard' && window.uiState?.activeNoteSource === 'keyboard') {
                window.soundModule.stopNote(false);
                // Clear visual state of keys
                document.querySelectorAll('.keyboard-key.active').forEach(k => 
                    k.classList.remove('active', 'key-pressed', 'key-released')
                );
            } else if (currentMode === 'xy' && window.uiState?.activeNoteSource === 'xy-pad') {
                window.soundModule.stopNote(false);
                // Clear XY pad visual state
                document.getElementById('xy-pad')?.classList.remove('active', 'touched');
                if (window.uiState) window.uiState.xyPad.active = false;
            }
            if (window.uiState) window.uiState.activeNoteSource = null;
        }
        
        // Update container state
        inputContainer.dataset.activeInput = nextMode;
        if (window.uiState) window.uiState.activeInputMode = nextMode;
        
        // Update button state
        if (nextMode === 'xy') {
            enhancedButton.classList.add('xy');
            enhancedButton.querySelector('.mode-indicator').textContent = 'MODE: XY';
        } else {
            enhancedButton.classList.remove('xy');
            enhancedButton.querySelector('.mode-indicator').textContent = 'MODE: KYBD';
        }
        
        // Add animation
        inputContainer.classList.add('switching');
        setTimeout(() => {
            inputContainer.classList.remove('switching');
        }, 500);
        
        // Create particle burst
        if (window.createParticleBurst) {
            const rect = enhancedButton.getBoundingClientRect();
            window.createParticleBurst(
                rect.left + rect.width / 2, 
                rect.top + rect.height / 2, 
                8
            );
        }
        
        // Show tooltip
        showTooltip(`Mode switched to ${nextMode === 'keyboard' ? 'Keyboard' : 'XY Pad'}`);
    });
    
    console.log("Input mode switch enhanced");
}

/**
 * Creates an improved preset selector with a wheel of options
 */
function setupEnhancedPresetSelector() {
    const presetContainer = document.getElementById('preset-area');
    if (!presetContainer) {
        console.warn("Preset area not found");
        return;
    }
    
    // Look for existing select element
    const existingSelect = presetContainer.querySelector('select');
    if (!existingSelect) {
        console.warn("Preset selector not found");
        return;
    }
    
    // Save reference to original select for later
    const originalSelect = existingSelect;
    const options = Array.from(originalSelect.options);
    const selectedOption = originalSelect.options[originalSelect.selectedIndex];
    
    // Create wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'preset-wheel-container';
    
    // Create wheel
    const wheel = document.createElement('div');
    wheel.className = 'preset-wheel';
    wheel.innerHTML = '<span class="preset-label">SCROLLS:</span>';
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .preset-wheel-container {
            position: relative;
            margin-bottom: 10px;
            height: 40px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .preset-wheel {
            position: relative;
            display: flex;
            border-radius: 20px;
            background: rgba(var(--element-base-color-rgb), 0.2);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5),
                        0 0 10px rgba(138, 127, 255, 0.5);
            border: 1px solid rgba(138, 127, 255, 0.3);
            padding: 5px;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
            white-space: nowrap;
            max-width: 90%;
        }
        
        .preset-wheel::-webkit-scrollbar {
            display: none;
        }
        
        .preset-label {
            position: sticky;
            left: 0;
            font-family: var(--font-arcane);
            font-size: 14px;
            color: var(--accent-color);
            text-shadow: 0 0 5px rgba(138, 127, 255, 0.5);
            padding: 0 10px;
            display: flex;
            align-items: center;
            background: linear-gradient(90deg, 
                rgba(var(--element-base-color-rgb), 0.8), 
                rgba(var(--element-base-color-rgb), 0.2)
            );
            z-index: 2;
        }
        
        .preset-wheel-item {
            padding: 5px 10px;
            margin: 0 5px;
            border-radius: 15px;
            font-family: var(--font-terminal);
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            background: transparent;
            color: var(--text-color-secondary);
            display: inline-block;
        }
        
        .preset-wheel-item.active {
            background: rgba(138, 127, 255, 0.3);
            color: var(--text-color-primary);
            box-shadow: 0 0 8px rgba(138, 127, 255, 0.5);
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    
    // Create preset items
    options.forEach((option, index) => {
        const item = document.createElement('div');
        item.className = `preset-wheel-item ${option.selected ? 'active' : ''}`;
        item.textContent = option.textContent.toUpperCase();
        item.dataset.value = option.value;
        
        item.addEventListener('click', () => {
            // Update all items
            wheel.querySelectorAll('.preset-wheel-item').forEach(el => {
                el.classList.remove('active');
            });
            item.classList.add('active');
            
            // Update original select and dispatch change event
            originalSelect.value = option.value;
            originalSelect.dispatchEvent(new Event('change'));
            
            // Create particle burst
            if (window.createParticleBurst) {
                const rect = item.getBoundingClientRect();
                window.createParticleBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    5
                );
            }
            
            // Show tooltip
            showTooltip(`Preset: ${option.textContent}`);
        });
        
        wheel.appendChild(item);
    });
    
    // Add wheel to container
    wheelContainer.appendChild(wheel);
    
    // Replace content in preset container
    presetContainer.innerHTML = '';
    presetContainer.appendChild(wheelContainer);
    
    // Add original select back (hidden) to maintain functionality
    originalSelect.style.display = 'none';
    presetContainer.appendChild(originalSelect);
    
    // Scroll to active item (after a small delay for layout)
    setTimeout(() => {
        const activeItem = wheel.querySelector('.preset-wheel-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 100);
    
    console.log("Enhanced preset selector setup complete");
}

/**
 * Sets up particle system for visual effects
 */
function setupParticleSystem() {
    // Create container for particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    // Track particles for cleanup
    const particles = [];
    const maxParticles = 20;
    
    // Create a particle at the specified position
    window.createParticle = function(x, y, size = null, color = null) {
        // Limit total particles
        if (particles.length >= maxParticles) {
            const oldestParticle = particles.shift();
            if (oldestParticle.parentNode) {
                oldestParticle.remove();
            }
        }
        
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize properties
        const particleSize = size || 10 + Math.random() * 20; // 10-30px
        const duration = 1 + Math.random() * 3; // 1-4s
        
        // Default color if none provided
        let particleColor = color || 'rgba(138, 127, 255, 0.8)';
        
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
        `;
        
        // Add drift animation with CSS variables
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = 50 + Math.random() * 100; // Random distance 50-150px
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        
        // Add animation
        particle.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.1)' },
            { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1)', offset: 0.1 },
            { opacity: 0, transform: `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.5)` }
        ], {
            duration: duration * 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Add to DOM
        particleContainer.appendChild(particle);
        
        // Store reference
        particles.push(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                // Remove from tracking array
                const index = particles.indexOf(particle);
                if (index > -1) {
                    particles.splice(index, 1);
                }
            }
        }, duration * 1000);
        
        return particle;
    };
    
    // Create a burst of particles
    window.createParticleBurst = function(x, y, count = 5) {
        // Create multiple particles around a point
        for (let i = 0; i < count; i++) {
            // Add some randomness to position
            const offsetX = x + (Math.random() - 0.5) * 40;
            const offsetY = y + (Math.random() - 0.5) * 40;
            
            // Create particle with slight delay
            setTimeout(() => {
                window.createParticle(offsetX, offsetY);
            }, i * 50); // Stagger creation
        }
    };
    
    console.log("Particle system initialized");
}

// ---- UTILITY FUNCTIONS ----

/**
 * Helper function to update slider visual track based on value
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
 * Shows a temporary tooltip with message
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