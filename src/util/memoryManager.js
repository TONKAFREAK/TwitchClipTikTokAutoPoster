class MemoryManager {
    constructor() {
        this.userHistory = new Map();
        this.cleanupInterval = setInterval(() => this.cleanupHistories(), 60000); // Check every minute
    }

    addToHistory(userId, prompt, response) {
        if (!this.userHistory.has(userId)) {
            this.userHistory.set(userId, []);
        }
        const history = this.userHistory.get(userId);
        const timestamp = Date.now(); 
        history.push({ prompt, response, timestamp });
    
        //console.log(`Added to history for user ${userId}: ${prompt}`);
    
        if (history.length > 50) {
            history.shift();
        }
    }

    getUserHistory(userId) {
        return this.userHistory.get(userId) || [];
    }

    // Removes entries older than 8 hours
    cleanupHistories() {
        const tenMinutesAgo = Date.now() - 480 * 60 * 1000;
        this.userHistory.forEach((history, userId) => {
            const initialLength = history.length;
            const updatedHistory = history.filter(entry => entry.timestamp > tenMinutesAgo);
            
            if (updatedHistory.length !== initialLength) {
                console.log(`Cleaned up history for user ${userId}. Removed ${initialLength - updatedHistory.length} entries.`);
                this.userHistory.set(userId, updatedHistory);
            }
    
            if (this.userHistory.get(userId).length === 0) {
                this.userHistory.delete(userId);
            }
        });
    }
    stopCleanup() {
        clearInterval(this.cleanupInterval);
    }

   resetUserHistory(userId) {
        if (this.userHistory.has(userId)) {
            this.userHistory.delete(userId);
            console.log(`User history for user ${userId} has been reset.`);
        } else {
            console.log(`No history found for user ${userId}.`);
        }
    }

}

module.exports = MemoryManager;