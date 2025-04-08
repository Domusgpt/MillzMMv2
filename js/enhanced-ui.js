// Debug version of enhanced-ui.js with better error handling
// This will help identify why some elements can't be found

document.addEventListener('DOMContentLoaded', () => {
    console.log("MELODIOUS MALEFICARUM Enhanced UI initializing...");
    
    // Debug: Log HTML structure to help identify element IDs
    console.log("Document structure:", document.documentElement.innerHTML);
    
    // Initialize with error handling for each component
    try {
        setupReducedGlassmorphism();
        console.log("Glassmorphism reduced for better visualizer visibility");
    } catch (error) {
        console.error("Error setting up reduced glassmorphism:", error);
    }
    
    try {
        setupVisualizerControls();
        console.log("Visualizer controller setup complete");
    } catch (error) {
        console.error("Error setting up visualizer controller:", error);
    }
    
    try {
        enhanceModuleFocus();
        console.log("Enhanced module focus effects setup complete");
    } catch (error) {
        console.error("Error setting up module focus:", error);
    }
    
    try {
        improveInputModeSwitch();
        console.log("Input mode switch enhanced");
    } catch (error) {
        console.error("Error improving input mode switch:", error);
    }
    
    // More detailed error handling for problem areas
    try {
        setupEnhancedPresetSelector();
        console.log("Preset selector enhanced");
    } catch (error) {
        console.warn("Preset selector setup error:", error);
        // Debug: Log what element we're trying to find
        const presetArea = document.getElementById('preset-area');
        console.log("Preset area element:", presetArea);
        const presetSelectors = document.querySelectorAll('select');
        console.log("All select elements found:", presetSelectors);
    }
    
    try {
        setupParticleSystem();
        console.log("Particle system initialized");
    } catch (error) {
        console.error("Error setting up particle system:", error);
    }
    
    // Show welcome tooltip
    showTooltip("Enhanced MELODIOUS MALEFICARUM Active", 3000);
    
    console.log("MALEFICARUM enhancements initialized!");
});

/**
 * Reduces glassmorphism effect to make the visualizer more visible
 */
function setupReducedGlassmorphism() {
    // Create a style element to add dynamic styles
    const style = document.createElement('style');
    style.textContent = `
        /* Reduce opacity of glassmorphic elements */
        .main-frame {
            background: rgba(45, 40, 65, 0.05) !important;
            backdrop-filter: blur(2px) !important;
        }
        
        .control-module {
            background: rgba(45, 40, 65, 0.08) !important;
            backdrop-filter: blur(1px) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Sets up visualizer controls with better error handling
 */
function setupVisualizerControls() {
    const visualizerArea = document.querySelector('.visualizer-area');
    if (!visualizerArea) {
        throw new Error("Visualizer area not found");
    }
    
    // Add VIZ mode toggle button
    const modeToggle = document.createElement('button');
    modeToggle.id = 'viz-mode-toggle';
    modeToggle.className = 'visualizer-mode-toggle';
    modeToggle.textContent = 'VIZ: OFF';
    modeToggle.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 20;
        background: rgba(45, 40, 65, 0.3);
        color: #e8ebf0;
        border: 1px solid rgba(138, 127, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
    `;
    visualizerArea.appendChild(modeToggle);
    
    // Mode toggle click handler
    let controlMode = 'off'; // 'off', 'xy', 'note'
    modeToggle.addEventListener('click', () => {
        // Cycle through modes
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
    
    // Add CSS for visualizer modes
    const style = document.createElement('style');
    style.textContent = `
        .visualizer-area.interactive {
            border-color: rgba(138, 127, 255, 0.3);
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
                        0 0 10px rgba(138, 127, 255, 0.3);
        }
        
        .visualizer-area.active {
            border-color: rgba(138, 127, 255, 0.6);
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
                        0 0 15px rgba(138, 127, 255, 0.5);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Enhances module focus with morphing effects
 */
function enhanceModuleFocus() {
    const modules = document.querySelectorAll('.control-module');
    if (!modules.length) {
        throw new Error("Control modules not found");
    }
    
    const controlsArea = document.querySelector('.controls-area');
    if (!controlsArea) {
        throw new Error("Controls area not found");
    }
    
    // Add CSS for enhanced module focusing
    const style = document.createElement('style');
    style.textContent = `
        /* Default state - more subtle */
        .controls-area .control-module {
            opacity: 0.85; 
            transform: scale(0.98);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Focused state */
        .controls-area .control-module.focused {
            opacity: 1;
            transform: scale(1.02);
            z-index: 10;
            box-shadow: 0 0 15px rgba(138, 127, 255, 0.8);
            background: rgba(45, 40, 65, 0.25) !important;
        }
        
        /* When another module has focus */
        .controls-area.has-focus .control-module:not(.focused) {
            opacity: 0.4;
            transform: scale(0.92);
            filter: blur(1px);
        }
    `;
    document.head.appendChild(style);
    
    // Track focused module
    let focusedModuleId = null;
    
    // Module focus functionality
    modules.forEach(module => {
        // Skip sub-modules
        if (module.classList.contains('sub-module')) return;
        
        console.log("Setting up focus for module:", module.id || "(unnamed module)");
        
        module.addEventListener('click', (e) => {
            // Skip if this is already the focused module
            if (focusedModuleId === module.id) return;
            
            console.log("Focusing module:", module.id || "(unnamed module)");
            
            // Remove focus from all modules
            modules.forEach(m => m.classList.remove('focused'));
            
            // Add focus to clicked module
            module.classList.add('focused');
            controlsArea.classList.add('has-focus');
            focusedModuleId = module.id;
            
            // Stop event bubbling
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
}

/**
 * Improves the input mode switch with better styling and animation
 */
function improveInputModeSwitch() {
    const swapButton = document.getElementById('input-swap-button');
    if (!swapButton) {
        // Try to find by class
        const swapButton = document.querySelector('.swap-button');
        if (!swapButton) {
            throw new Error("Input swap button not found");
        }
    }
    
    const inputContainer = document.getElementById('input-container');
    if (!inputContainer) {
        // Try to find by class
        const inputContainer = document.querySelector('.input-module-container');
        if (!inputContainer) {
            throw new Error("Input container not found");
        }
    }
    
    // Log the elements for debugging
    console.log("Found swap button:", swapButton);
    console.log("Found input container:", inputContainer);
    
    // Add CSS for input container switching animation
    const style = document.createElement('style');
    style.textContent = `
        /* Input container switching animation */
        .input-module-container.switching {
            animation: moduleSwitch 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes moduleSwitch {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.9); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Enhance button appearance
    swapButton.style.cssText = `
        background: linear-gradient(145deg, #262333, #1a1727);
        border: 1px solid rgba(138, 127, 255, 0.3);
        border-radius: 5px;
        padding: 5px 10px;
        font-weight: 700;
        font-size: 11px;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // Save the original click handler
    const originalClick = swapButton.onclick;
    
    // Add our enhanced click handler
    swapButton.addEventListener('click', () => {
        console.log("Mode switch button clicked");
        
        // Get current mode from container data attribute
        const currentMode = inputContainer.dataset.activeInput || 'keyboard';
        const nextMode = currentMode === 'keyboard' ? 'xy' : 'keyboard';
        
        console.log(`Swapping input mode from ${currentMode} to ${nextMode}`);
        
        // Update container state
        inputContainer.dataset.activeInput = nextMode;
        
        // Add animation
        inputContainer.classList.add('switching');
        setTimeout(() => {
            inputContainer.classList.remove('switching');
        }, 500);
        
        // Show tooltip
        showTooltip(`Mode switched to ${nextMode === 'keyboard' ? 'Keyboard' : 'XY Pad'}`);
        
        // Call original handler if it exists
        if (typeof originalClick === 'function') {
            originalClick.call(swapButton);
        }
    });
}

/**
 * Creates an improved preset selector with a wheel of options
 */
function setupEnhancedPresetSelector() {
    // Look for preset selector container
    const presetContainer = document.getElementById('preset-area');
    if (!presetContainer) {
        // Try to find by class
        const presetContainer = document.querySelector('.preset-selector-container');
        if (!presetContainer) {
            throw new Error("Preset area not found");
        }
    }
    
    console.log("Found preset container:", presetContainer);
    
    // Look for existing select element
    let existingSelect = presetContainer.querySelector('select');
    if (!existingSelect) {
        console.warn("No select element found in preset container");
        
        // Create a temporary select if none exists
        existingSelect = document.createElement('select');
        existingSelect.innerHTML = `
            <option value="grimoire_pulse" selected>GRIMOIRE PULSE</option>
            <option value="vaporwave">VAPORWAVE</option>
            <option value="ambient_drone">AMBIENT DRONE</option>
            <option value="synthwave_lead">SYNTHWAVE LEAD</option>
        `;
        presetContainer.appendChild(existingSelect);
        existingSelect.style.display = 'none';
    }
    
    const options = Array.from(existingSelect.options);
    console.log("Preset options:", options.map(opt => opt.value));
    
    // Create wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'preset-wheel-container';
    wheelContainer.style.cssText = `
        position: relative;
        margin-bottom: 10px;
        height: 40px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create wheel
    const wheel = document.createElement('div');
    wheel.className = 'preset-wheel';
    wheel.style.cssText = `
        position: relative;
        display: flex;
        border-radius: 20px;
        background: rgba(45, 40, 65, 0.2);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.5),
                    0 0 10px rgba(138, 127, 255, 0.5);
        border: 1px solid rgba(138, 127, 255, 0.3);
        padding: 5px;
        overflow-x: auto;
        white-space: nowrap;
        max-width: 90%;
        scrollbar-width: none;
    `;
    
    // Add "SCROLLS:" label
    const label = document.createElement('div');
    label.textContent = 'SCROLLS:';
    label.style.cssText = `
        position: sticky;
        left: 0;
        padding: 0 10px;
        display: flex;
        align-items: center;
        background: linear-gradient(90deg, 
            rgba(45, 40, 65, 0.8), 
            rgba(45, 40, 65, 0.2)
        );
        z-index: 2;
    `;
    wheel.appendChild(label);
    
    // Create preset items
    options.forEach(option => {
        const item = document.createElement('div');
        item.className = `preset-wheel-item ${option.selected ? 'active' : ''}`;
        item.textContent = option.textContent.toUpperCase();
        item.dataset.value = option.value;
        item.style.cssText = `
            padding: 5px 10px;
            margin: 0 5px;
            border-radius: 15px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            background: transparent;
            color: #c8cdd5;
            display: inline-block;
        `;
        
        if (option.selected) {
            item.style.background = 'rgba(138, 127, 255, 0.3)';
            item.style.color = '#ffffff';
            item.style.boxShadow = '0 0 8px rgba(138, 127, 255, 0.5)';
            item.style.transform = 'scale(1.1)';
        }
        
        item.addEventListener('click', () => {
            // Update all items
            wheel.querySelectorAll('.preset-wheel-item').forEach(el => {
                el.classList.remove('active');
                el.style.background = 'transparent';
                el.style.color = '#c8cdd5';
                el.style.boxShadow = 'none';
                el.style.transform = 'scale(1)';
            });
            
            item.classList.add('active');
            item.style.background = 'rgba(138, 127, 255, 0.3)';
            item.style.color = '#ffffff';
            item.style.boxShadow = '0 0 8px rgba(138, 127, 255, 0.5)';
            item.style.transform = 'scale(1.1)';
            
            // Update original select and dispatch change event
            existingSelect.value = option.value;
            existingSelect.dispatchEvent(new Event('change'));
            
            // Show tooltip
            showTooltip(`Preset: ${option.textContent}`);
        });
        
        wheel.appendChild(item);
    });
    
    // Hide scrollbar
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
        .preset-wheel::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(scrollbarStyle);
    
    // Add wheel to container
    wheelContainer.appendChild(wheel);
    
    // Replace content in preset container
    presetContainer.innerHTML = '';
    presetContainer.appendChild(wheelContainer);
    presetContainer.appendChild(existingSelect); // Keep original but hidden
    existingSelect.style.display = 'none';
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
        font-size: 14px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 0 10px rgba(138, 127, 255, 0.5),
                    0 0 20px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(138, 127, 255, 0.3);
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