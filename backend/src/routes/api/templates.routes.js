// routes/api/templates.routes.js
const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../../middleware/auth.middleware');
const { listTemplates, createTemplate } = require('../../services/docusign/template.service');

router.get('/templates', checkAuth, async (req, res) => {
    try {
        const templates = await listTemplates(req.session.accountId);
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/templates', checkAuth, checkRole('staff'), async (req, res) => {
    try {
        const { name, document } = req.body;
        const template = await createTemplate(
            req.session.accountId,
            name,
            document
        );
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;