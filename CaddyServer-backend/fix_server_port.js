const db = require('./db');

db.serialize(() => {
    db.run("UPDATE servers SET apiPort = 2019, apiUrl = 'http://10.240.150.153' WHERE id = 10", function (err) {
        if (err) {
            console.error('Failed to update server:', err.message);
        } else {
            console.log(`Updated Server 10: Changed port 3000 -> 2019. Changes: ${this.changes}`);
        }
    });
});
