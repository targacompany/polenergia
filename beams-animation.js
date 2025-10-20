class BeamsAnimation {
    constructor(container) {
        this.container = container;
        this.beamLength = 115;
        this.beamSpeedMin = 4; // minimum speed in seconds
        this.beamSpeedMax = 5; // maximum speed in seconds
        this.occupiedLines = new Set(); // Track occupied lines
        this.activeBeams = []; // Track all active beams
        this.allLines = []; // Store all available lines
        this.hasActiveHorizontalBeam = false; // Track if horizontal beam is active
        this.hasActiveVerticalBeam = false; // Track if vertical beam is active
        
        this.init();
    }
    
    getThemeColors(element) {
        // Check if element or parent section has theme-dark class
        const sectionElement = element.classList.contains('section') ? element : element.closest('.section');
        const isDarkTheme = sectionElement && sectionElement.classList.contains('theme-dark');
        
        if (isDarkTheme) {
            return {
                beamStartColor: '#01EFA7',
                beamEndColor: 'rgba(31, 48, 112, 0.5)'
            };
        } else {
            return {
                beamStartColor: '#01EFA7',
                beamEndColor: 'transparent'
            };
        }
    }
    
    
    init() {
        // Find all horizontal and vertical lines within this container
        const horizontalLines = this.container.querySelectorAll('.horizontal-line');
        const verticalLines = this.container.querySelectorAll('.vertical-line');
        
        // Store all lines with their orientation
        this.allLines = [];
        horizontalLines.forEach(line => {
            this.allLines.push({ element: line, isVertical: false });
        });
        verticalLines.forEach(line => {
            this.allLines.push({ element: line, isVertical: true });
        });
        
        // Start initial beams - one horizontal and one vertical (with 4 second delay)
        setTimeout(() => {
            this.startBeam(false); // Start horizontal beam
            this.startBeam(true);  // Start vertical beam
        }, 4000);
        
        // Watch for new lines added to this container
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('horizontal-line')) {
                            this.allLines.push({ element: node, isVertical: false });
                        }
                        if (node.classList && node.classList.contains('vertical-line')) {
                            this.allLines.push({ element: node, isVertical: true });
                        }
                        // Check children
                        if (node.querySelectorAll) {
                            const hLines = node.querySelectorAll('.horizontal-line');
                            const vLines = node.querySelectorAll('.vertical-line');
                            hLines.forEach(line => {
                                this.allLines.push({ element: line, isVertical: false });
                            });
                            vLines.forEach(line => {
                                this.allLines.push({ element: line, isVertical: true });
                            });
                        }
                    }
                });
            });
        });
        
        this.observer.observe(this.container, { childList: true, subtree: true });
    }
    
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    }
    
    startBeam(isVertical) {
        // Check if beam of this type is already active
        if (isVertical && this.hasActiveVerticalBeam) return;
        if (!isVertical && this.hasActiveHorizontalBeam) return;
        
        // Get available lines of the specified type (not occupied and in viewport)
        const availableLines = this.allLines.filter(lineInfo => {
            const lineId = this.getLineId(lineInfo.element);
            return lineInfo.isVertical === isVertical && 
                   !this.occupiedLines.has(lineId) &&
                   this.isInViewport(lineInfo.element);
        });
        
        if (availableLines.length === 0) {
            // No available lines of this type in viewport, try again later
            setTimeout(() => this.startBeam(isVertical), 500);
            return;
        }
        
        // Pick a random available line of the correct type
        const randomLine = availableLines[Math.floor(Math.random() * availableLines.length)];
        const lineId = this.getLineId(randomLine.element);
        
        this.createBeam(randomLine.element, randomLine.isVertical, lineId);
    }
    
    getLineId(line) {
        // Create unique identifier for line
        if (!line.dataset.beamLineId) {
            line.dataset.beamLineId = 'line_' + Math.random().toString(36).substr(2, 9);
        }
        return line.dataset.beamLineId;
    }
    
    createBeam(line, isVertical, lineId) {
        const rect = line.getBoundingClientRect();
        
        // Find the closest element with data-bkg attribute
        const themeElement = line.closest('[data-bkg]');
        if (!themeElement) return;
        
        // Get colors based on theme
        const colors = this.getThemeColors(themeElement);
        
        // Fixed direction: vertical = top to bottom (1), horizontal = left to right (1)
        const direction = 1;
        
        // Create gradient based on orientation
        // Vertical: top to bottom (0deg gradient)
        // Horizontal: left to right (270deg gradient)
        let gradient;
        if (isVertical) {
            gradient = `linear-gradient(0deg, ${colors.beamStartColor} 0%, ${colors.beamEndColor} 100%)`;
        } else {
            gradient = `linear-gradient(270deg, ${colors.beamStartColor} 0%, ${colors.beamEndColor} 100%)`;
        }
        
        // Create beam element
        const beam = document.createElement('div');
        beam.className = 'animated-beam';
        Object.assign(beam.style, {
            position: 'absolute',
            pointerEvents: 'none',
            opacity: '0.9',
            background: gradient,
            borderRadius: '0.25rem',
            zIndex: '1'
        });
        
        // Position beam on the line
        if (isVertical) {
            const startY = direction > 0 ? -this.beamLength : rect.height;
            Object.assign(beam.style, {
                width: '2px',
                height: this.beamLength + 'px',
                left: '50%',
                transform: 'translateX(-50%)',
                top: startY + 'px'
            });
        } else {
            const startX = direction > 0 ? -this.beamLength : rect.width;
            Object.assign(beam.style, {
                height: '2px',
                width: this.beamLength + 'px',
                top: '50%',
                transform: 'translateY(-50%)',
                left: startX + 'px'
            });
        }
        
        // Add beam to line
        // Only set position if not already set to avoid layout shifts
        const currentPosition = window.getComputedStyle(line).position;
        if (currentPosition === 'static') {
            line.style.position = 'relative';
        }
        line.appendChild(beam);
        
        // Mark line as occupied and beam type as active
        this.occupiedLines.add(lineId);
        if (isVertical) {
            this.hasActiveVerticalBeam = true;
        } else {
            this.hasActiveHorizontalBeam = true;
        }
        
        // Random speed for this beam
        const randomSpeed = this.beamSpeedMin + Math.random() * (this.beamSpeedMax - this.beamSpeedMin);
        
        // GSAP animation
        const timeline = gsap.timeline({
            onComplete: () => {
                beam.remove();
                // Free up the line
                this.occupiedLines.delete(lineId);
                
                // Mark beam type as inactive
                if (isVertical) {
                    this.hasActiveVerticalBeam = false;
                } else {
                    this.hasActiveHorizontalBeam = false;
                }
                
                // Remove from active beams
                const index = this.activeBeams.findIndex(b => b.beam === beam);
                if (index > -1) {
                    this.activeBeams.splice(index, 1);
                }
                
                // Immediately start a new beam of the same type
                this.startBeam(isVertical);
            }
        });
        
        if (isVertical) {
            const endY = direction > 0 ? rect.height + this.beamLength : -this.beamLength;
            timeline.to(beam, {
                top: endY + 'px',
                duration: randomSpeed,
                ease: "power1.inOut"
            });
        } else {
            const endX = direction > 0 ? rect.width + this.beamLength : -this.beamLength;
            timeline.to(beam, {
                left: endX + 'px',
                duration: randomSpeed,
                ease: "power1.inOut"
            });
        }
        
        beam.timeline = timeline;
        this.activeBeams.push({ beam, timeline, lineId });
    }
    
    destroy() {
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Stop all active beams
        this.activeBeams.forEach(({ beam, timeline }) => {
            if (timeline) {
                timeline.kill();
            }
            if (beam && beam.parentElement) {
                beam.remove();
            }
        });
        
        // Clear tracking
        this.activeBeams = [];
        this.occupiedLines.clear();
        this.hasActiveHorizontalBeam = false;
        this.hasActiveVerticalBeam = false;
    }
}

// Initialize instances for all .bkg-grid-wrap elements
const beamsAnimationInstances = [];

function initBeamsAnimations() {
    const containers = document.querySelectorAll('.bkg-grid-wrap');
    containers.forEach(container => {
        // Skip if already initialized
        if (container.beamsAnimationInstance) return;
        
        // Create new instance and store reference
        const instance = new BeamsAnimation(container);
        container.beamsAnimationInstance = instance;
        beamsAnimationInstances.push(instance);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBeamsAnimations();
});

if (document.readyState !== 'loading') {
    initBeamsAnimations();
}

// Watch for new .bkg-grid-wrap elements added to DOM
const containerObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('bkg-grid-wrap')) {
                    if (!node.beamsAnimationInstance) {
                        const instance = new BeamsAnimation(node);
                        node.beamsAnimationInstance = instance;
                        beamsAnimationInstances.push(instance);
                    }
                }
                // Check children
                if (node.querySelectorAll) {
                    const containers = node.querySelectorAll('.bkg-grid-wrap');
                    containers.forEach(container => {
                        if (!container.beamsAnimationInstance) {
                            const instance = new BeamsAnimation(container);
                            container.beamsAnimationInstance = instance;
                            beamsAnimationInstances.push(instance);
                        }
                    });
                }
            }
        });
    });
});

containerObserver.observe(document.body, { childList: true, subtree: true });

// Export for manual control
window.BeamsAnimation = BeamsAnimation;
window.beamsAnimationInstances = beamsAnimationInstances;
window.initBeamsAnimations = initBeamsAnimations;

