--create db
CREATE DATABASE enlearn;
CREATE USER entgbot WITH PASSWORD 'Qwerty';
GRANT ALL ON DATABASE enlearn TO entgbot;
ALTER ROLE entgbot WITH LOGIN;

--create schema
CREATE TABLE botuser (
    id INTEGER PRIMARY KEY,
    currentWordSet INTEGER[],
    webHash TEXT,
    name TEXT,
    username TEXT,
    userId INTEGER,
    sowDescription BOOLEAN DEFAULT true,
    
    current_test_errors INTEGER,
    current_test_passed_count INTEGER,
    current_test_all_count INTEGER,
    UNIQUE(webHash)
);

CREATE TABLE word(
    id SERIAL PRIMARY KEY,
    userId INTEGER,
    original TEXT NOT NULL,
    translate TEXT NOT NULL,
    description TEXT,
    value INTEGER,
    FOREIGN KEY (userId) REFERENCES botuser (id),
    UNIQUE(userId, original)
);

--alters


ALTER TABLE botuser ADD COLUMN current_test_all_count INTEGER;
ALTER TABLE botuser ADD UNIQUE (webHash);
ALTER TABLE botuser ALTER COLUMN currentWordSet [SET DATA] TYPE INTEGER[];
DROP TABLE word;
DROP TABLE botuser;
DROP TABLE user_web_sessions;

--weighted random test
CREATE TABLE test(
  id SERIAL PRIMARY KEY,
  value INTEGER  
);

INSERT INTO test(hash, userid, submitCode, status) VALUES ($1, $2, $3, $4);

INSERT INTO user_web_sessions(value) VALUES

SELECT id, value, random()*power((value+1), 2) FROM test ORDER BY random()*(value+1);
SELECT id, value, random()/power((value+1), 2) FROM test ORDER BY random()/power((value+1), 2);
SELECT id, value FROM test ORDER BY random()/power((value+1), 2);

--common queries
UPDATE botuser SET currentWordSet=$1 WHERE id=$2;
UPDATE word SET value=value+1 WHERE id=$1;
UPDATE botuser SET currentWordSet = array_remove(currentWordSet, $1) WHERE id=$2;

SELECT (currentWordSet[0]) as word FROM botuser WHERE id=$1;

update users set flags = array_remove(flags, 'active')

SELECT * FROM user_web_sessions WHERE hash=$1;

SELECT * FROM word WHERE userId=628902357 ORDER BY random()/power((value+1), 5/3) LIMIT 100;

UPDATE botuser SET currentWordSet=[] WHERE id=628902357;
  SELECT currentWordSet[0] FROM botuser WHERE id=628902357;

UPDATE word SET value=25;