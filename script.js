
let allMessages = [];

async function processFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one JSON file');
        return;
    }

    allMessages = [];

    for (let file of files) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.messages) {
                allMessages = allMessages.concat(data.messages);
            }
        } catch (e) {
            console.error('Error reading file:', file.name, e);
        }
    }

    if (allMessages.length === 0) {
        alert('No messages found in the uploaded files');
        return;
    }

    analyzeMessages();
}

function analyzeMessages() {
    const messageCounts = {};
    const wordCounts = {};
    const reelCounts = {};
    const topWords = {};
    const topEmojis = {};

    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2700}-\u{27BF}]/gu;

    allMessages.forEach(msg => {
        const sender = msg.sender_name || 'Unknown';
        const content = msg.content || '';
        
        messageCounts[sender] = (messageCounts[sender] || 0) + 1;
        
        const words = content.split(/\s+/).filter(w => w.length > 0);
        wordCounts[sender] = (wordCounts[sender] || 0) + words.length;
        
        if (msg.share && JSON.stringify(msg.share).includes('instagram.com/reel')) {
            reelCounts[sender] = (reelCounts[sender] || 0) + 1;
        }

        if (!topWords[sender]) {
            topWords[sender] = {};
            topEmojis[sender] = {};
        }

        words.forEach(word => {
            const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (w.length > 0) {
                topWords[sender][w] = (topWords[sender][w] || 0) + 1;
            }
        });

        const emojis = content.match(emojiRegex) || [];
        emojis.forEach(emoji => {
            topEmojis[sender][emoji] = (topEmojis[sender][emoji] || 0) + 1;
        });
    });

    displayResults(messageCounts, wordCounts, reelCounts, topWords, topEmojis);
}

function displayResults(messageCounts, wordCounts, reelCounts, topWords, topEmojis) {
    document.getElementById('results').style.display = 'block';

    let msgHTML = '';
    Object.entries(messageCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, count]) => {
            msgHTML += `<div class="stat-item">
                <span class="stat-name">${name}</span>
                <span class="stat-value">${count.toLocaleString()}</span>
            </div>`;
        });
    document.getElementById('messageCounts').innerHTML = msgHTML;

    let wordHTML = '';
    Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, count]) => {
            wordHTML += `<div class="stat-item">
                <span class="stat-name">${name}</span>
                <span class="stat-value">${count.toLocaleString()}</span>
            </div>`;
        });
    document.getElementById('wordCounts').innerHTML = wordHTML;

    let reelHTML = '';
    Object.entries(reelCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, count]) => {
            reelHTML += `<div class="stat-item">
                <span class="stat-name">${name}</span>
                <span class="stat-value">${count.toLocaleString()}</span>
            </div>`;
        });
    document.getElementById('reelCounts').innerHTML = reelHTML || '<p style="color: #999;">No reels found</p>';

    let detailsHTML = '';
    Object.keys(messageCounts).forEach(person => {
        const personTopWords = Object.entries(topWords[person] || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const personTopEmojis = Object.entries(topEmojis[person] || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        detailsHTML += `
            <div class="person-section">
                <div class="person-header">
                    <div class="person-name">${person}</div>
                    <div class="person-stats">
                        <div class="mini-stat">
                            <div class="mini-stat-value">${messageCounts[person].toLocaleString()}</div>
                            <div class="mini-stat-label">Messages</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">${wordCounts[person].toLocaleString()}</div>
                            <div class="mini-stat-label">Words</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-value">${reelCounts[person] || 0}</div>
                            <div class="mini-stat-label">Reels</div>
                        </div>
                    </div>
                </div>
                
                <div class="words-container">
                    <div class="section-title">🔤 Top Words</div>
                    ${personTopWords.map(([word, count]) => 
                        `<span class="word-item">${word}<span class="word-count">${count}</span></span>`
                    ).join('')}
                </div>

                <div class="emojis-container">
                    <div class="section-title">😊 Top Emojis</div>
                    ${personTopEmojis.map(([emoji, count]) => 
                        `<span class="emoji-item"><span class="emoji-display">${emoji}</span><span class="stat-value">${count}</span></span>`
                    ).join('')}
                </div>
            </div>
        `;
    });

    document.getElementById('personDetails').innerHTML = detailsHTML;
}
