const db = require('./db');

db.serialize(() => {
    db.get('SELECT * FROM servers WHERE id = 10', (err, row) => {
        if (err) console.error('Server Error:', err);
        else console.log('SERVER 10:', row);
    });

    db.get('SELECT * FROM configs WHERE id = 3', (err, row) => {
        if (err) console.error('Config Error:', err);
        else console.log('CONFIG 3:', row);
    });

    db.get('SELECT * FROM configs WHERE id = 5', (err, row) => {
        if (err) console.error('Config Error:', err);
        else console.log('CONFIG 5:', row);
    });
});
