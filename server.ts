import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Request, Response } from 'express';
import OAuth2Server, { Request as OAuthRequest, Response as OAuthResponse, Token, Client, AuthorizationCode } from 'oauth2-server';

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const oauth = new OAuth2Server({
    model: {
        getAccessToken: async (token: string): Promise<Token | null> => {
            console.log('getAccessToken called with token:', token);
            if (token === process.env.ACCESS_TOKEN) {
                return {
                    accessToken: process.env.ACCESS_TOKEN,
                    client: { id: process.env.CLIENT_ID, grants: ['authorization_code'] },
                    user: { id: process.env.USER_ID },
                    accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes expiry
                } as Token;
            }
            return null;
        },
        getClient: async (clientId: string, clientSecret: string): Promise<Client | null> => {
            console.log('getClient called with clientId:', clientId, 'clientSecret:', clientSecret);
            if (clientId === process.env.CLIENT_ID && clientSecret === process.env.CLIENT_SECRET) {
                return {
                    id: process.env.CLIENT_ID,
                    grants: ['authorization_code'],
                    redirectUris: [process.env.REDIRECT_URI],
                } as Client;
            }
            return null;
        },
        saveToken: async (token: Token, client: Client, user: any): Promise<Token> => {
            console.log('saveToken called with token:', token, 'client:', client, 'user:', user);
            return {
                accessToken: process.env.ACCESS_TOKEN,
                client: { id: process.env.CLIENT_ID, grants: ['authorization_code'] },
                user: { id: process.env.USER_ID },
                accessTokenExpiresAt: new Date(Date.now() + 10000), // 10 seconds expiry
            } as Token;
        },
        getAuthorizationCode: async (authorizationCode: string): Promise<AuthorizationCode | null> => {
            console.log('getAuthorizationCode called with authorizationCode:', authorizationCode);
            if (authorizationCode === process.env.AUTHORIZATION_CODE) {
                return {
                    authorizationCode: process.env.AUTHORIZATION_CODE,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes expiry
                    redirectUri: process.env.REDIRECT_URI,
                    client: { id: process.env.CLIENT_ID, grants: ['authorization_code'] },
                    user: { id: process.env.USER_ID },
                } as AuthorizationCode;
            }
            return null;
        },
        saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: any): Promise<AuthorizationCode> => {
            console.log('saveAuthorizationCode called with code:', code, 'client:', client, 'user:', user);
            return {
                authorizationCode: process.env.AUTHORIZATION_CODE,
                expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes expiry
                redirectUri: process.env.REDIRECT_URI,
                client: { id: process.env.CLIENT_ID, grants: ['authorization_code'] },
                user: { id: process.env.USER_ID },
            } as AuthorizationCode;
        },
        revokeAuthorizationCode: async (code: AuthorizationCode): Promise<boolean> => {
            console.log('revokeAuthorizationCode called with code:', code);
            return true;
        },
        getUser: async (username: string, password: string): Promise<any> => {
            console.log('getUser called with username:', username, 'password:', password);
            if (username === process.env.USER_ID && password === process.env.PASSWORD_ID) {
                return { id: process.env.USER_ID };
            }
            return null;
        },
        verifyScope: async (token: Token, scope: string | string[]): Promise<boolean> => {
            console.log('verifyScope called with token:', token, 'scope:', scope);
            return true;
        },
    },
});

// Route to handle the authorization request
app.get('/oauth/authorize', (req: Request, res: Response) => {
    const { response_type, client_id, redirect_uri, scope, state } = req.query;

    if (response_type !== 'code') {
        return res.status(400).json({ error: 'unsupported_response_type' });
    }

    if (client_id !== process.env.CLIENT_ID || redirect_uri !== process.env.REDIRECT_URI) {
        return res.status(400).json({ error: 'invalid_client' });
    }

    const authorizationCode = process.env.AUTHORIZATION_CODE; // This would be generated dynamically in a real app

    res.redirect(`${redirect_uri}?code=${authorizationCode}&state=${state}`);
});

app.post('/oauth/token', async (req: Request, res: Response) => {
    const request = new OAuthRequest(req);
    const response = new OAuthResponse(res);
    try {
        const token = await oauth.token(request, response);
        res.json(token);
    } catch (err: any) {
        console.error('Error in /oauth/token:', err);
        res.status(err.code || 500).json(err);
    }
});

app.listen(3000, () => {
    console.log('OAuth2 mock server is running on port 3000');
});
