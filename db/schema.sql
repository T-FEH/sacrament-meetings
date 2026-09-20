-- Sacrament Meeting Planner schema
-- Nested structures (hymns, speakers, ward business) are stored as JSONB;
-- announcements is a TEXT[] since it is a flat list of strings.

CREATE TABLE IF NOT EXISTS meetings (
  id             SERIAL        PRIMARY KEY,
  date           DATE          NOT NULL UNIQUE,
  meeting_type   VARCHAR(20)   NOT NULL
                               CHECK (meeting_type IN
                                 ('testimony','regular','stake','general','special')),
  presiding      VARCHAR(255)  NOT NULL,
  conducting     VARCHAR(255)  NOT NULL,
  announcements  TEXT[]        DEFAULT '{}',
  opening_hymn   JSONB         NOT NULL,
  opening_prayer VARCHAR(255)  NOT NULL,
  ward_business  JSONB         DEFAULT '[]',
  stake_business BOOLEAN       DEFAULT false,
  sacrament_hymn JSONB         NOT NULL,
  speakers       JSONB         DEFAULT '[]',
  closing_hymn   JSONB         NOT NULL,
  closing_prayer VARCHAR(255)  NOT NULL
);

-- Supports the ORDER BY date DESC used by the paginated list.
CREATE INDEX IF NOT EXISTS meetings_date_desc_idx ON meetings (date DESC);
