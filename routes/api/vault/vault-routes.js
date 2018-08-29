/**
 * Created by vedha on 25-09-2017.
 */


var express = require('express');
var router = express.Router();

var vaultCtrl = require('./vault-ctrl');

router.get('/list',vaultCtrl.getVaultList);
router.post('/folder',vaultCtrl.createNewFolder);
router.get('/folder',vaultCtrl.getFolderData);
router.delete('/item',vaultCtrl.deleteVaultItem);
router.get('/masterData',vaultCtrl.getMasterData);
router.post('/item',vaultCtrl.saveVaultItem);
router.get('/item',vaultCtrl.getVaultItem);


router.post('/saveBulkVault',vaultCtrl.saveBulkVaultTitleList);
router.get('/getBulkVault',vaultCtrl.getvaultBulkList);
router.get('/archive',vaultCtrl.archiveItem);


module.exports = router;