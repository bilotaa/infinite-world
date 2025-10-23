/**
 * LoadingScreen - Displays loading progress before homepage appears
 * References existing HTML structure in index.html
 *
 * Usage:
 *   const loadingScreen = new LoadingScreen()
 *   loadingScreen.show()
 *   loadingScreen.updateProgress(50, 'Loading models...')
 *   loadingScreen.hide()
 */
export default class LoadingScreen {
    constructor() {
        // Cache references to existing HTML elements
        this.overlay = document.getElementById('loading-overlay')
        this.progressFill = document.getElementById('loading-progress-fill')
        this.percentageText = document.getElementById('loading-percentage')
        this.detailText = document.getElementById('loading-detail')

        // Verify all elements exist
        if (!this.overlay || !this.progressFill || !this.percentageText || !this.detailText) {
            console.error('LoadingScreen: Required DOM elements not found')
        }
    }

    /**
     * Update progress bar and text
     * @param {number} percentage - Progress percentage (0-100)
     * @param {string} currentItem - Description of current loading item
     */
    updateProgress(percentage, currentItem) {
        if (this.progressFill) {
            this.progressFill.style.width = percentage + '%'
        }

        if (this.percentageText) {
            this.percentageText.textContent = Math.round(percentage) + '%'
        }

        if (this.detailText && currentItem) {
            this.detailText.textContent = currentItem
        }
    }

    /**
     * Hide loading screen with fade out transition (0.5s)
     */
    hide() {
        if (this.overlay) {
            // Add 'hidden' class to trigger fade out
            this.overlay.classList.add('hidden')

            // After transition completes, set display to none
            setTimeout(() => {
                this.overlay.style.display = 'none'
            }, 500)
        }
    }

    /**
     * Show loading screen (if previously hidden)
     */
    show() {
        if (this.overlay) {
            // Set display to flex
            this.overlay.style.display = 'flex'

            // Remove 'hidden' class to trigger fade in
            this.overlay.classList.remove('hidden')
        }
    }
}
