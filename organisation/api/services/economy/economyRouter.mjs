import { Router } from "express";
import DatabaseHelper from "../../../../operations/databaseHelper.mjs";
import TradingHelper from "../../../../operations/minigames/medium/economy/items/tradingHelper.mjs";
import { POINTS } from "../../../coop.mjs";

const EconomyRouter = Router();

EconomyRouter.get('/', async (req, res) => {
    res.status(200).json({
        "ECONOMY": "TESTING"
    });
});

EconomyRouter.get('/leaderboard', async (req, res) => {
    const leaderboardRows = await POINTS.getLeaderboard(0);
    res.status(200).json(leaderboardRows);
});

EconomyRouter.get('/trades', async (req, res) => {
    const trades = await TradingHelper.all(50);
    res.status(200).json(trades);
});

EconomyRouter.get('/items', async (req, res) => {
    const items = await DatabaseHelper.manyQuery({
        name: 'all-items',
        text: `
            SELECT * FROM (
                SELECT DISTINCT ON (i.item_code) i.item_code, i.owner_id, i.quantity, total_qty, ROUND((i.quantity / total_qty) * 100) as share
                FROM items i
    
                INNER JOIN ( 
                    SELECT item_code, MAX(quantity) AS highest, SUM(quantity) as total_qty
                    FROM items
                    GROUP BY item_code
                ) AS grouped_items
                ON  grouped_items.item_code = i.item_code
                AND grouped_items.highest = i.quantity
            ) t
            ORDER BY total_qty DESC
            `
    });
    return res.status(200).json(items);
});

EconomyRouter.get('/items/:code', async (req, res) => {
    const code = req.params.code;

    const item = await DatabaseHelper.manyQuery({
        name: 'get-item-shares',
        text: `
            SELECT quantity, owner_id, username FROM items 

            INNER JOIN users 
            ON items.owner_id = discord_id
            WHERE item_code = $1
            ORDER BY quantity DESC`,
        values: [code]
    });

    return res.status(200).json(item);
});

export default EconomyRouter;
