"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSignupWorkflow = UserSignupWorkflow;
exports.UserUpdateWorkflow = UserUpdateWorkflow;
exports.deleteUserInfoWorkflow = deleteUserInfoWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { updateUserStatusInDB, userCreationInAuth0, updateUserInAuth0, deleteUserInAuth0, deleteUserInDb } = (0, workflow_1.proxyActivities)({
    retry: {
        initialInterval: '1 second',
        maximumInterval: '30 seconds',
        backoffCoefficient: 2,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '2 minutes',
});
function UserSignupWorkflow(name, email, password, _id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authId = yield userCreationInAuth0({ name, email, password });
            yield (0, workflow_1.sleep)('5000');
            yield updateUserStatusInDB({ userId: _id, statusValue: "succeed", failureReason: undefined, authId: authId });
        }
        catch (err) {
            yield updateUserStatusInDB({ userId: _id, statusValue: "failed", failureReason: "failed while updating to auth0" });
            throw err;
        }
    });
}
function UserUpdateWorkflow(authId, _id, name, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateUserInAuth0({ authId, name, password });
            yield (0, workflow_1.sleep)('5000');
            yield updateUserStatusInDB({ userId: _id, statusValue: "succeed" });
        }
        catch (err) {
            yield updateUserStatusInDB({ userId: _id, statusValue: "failed", failureReason: "failed while updating to auth0" });
            throw err;
        }
    });
}
function deleteUserInfoWorkflow(authId, _id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield deleteUserInAuth0(authId);
            yield (0, workflow_1.sleep)('5000');
            yield deleteUserInDb(authId);
        }
        catch (err) {
            yield updateUserStatusInDB({ userId: _id, statusValue: "failed", failureReason: "failed while deletion to auth0" });
            throw err;
        }
    });
}
