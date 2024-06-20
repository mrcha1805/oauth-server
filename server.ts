import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import OAuth2Server, { Request as OAuthRequest, Response as OAuthResponse, Token, Client } from 'oauth2-server';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const oauth = new OAuth2Server({
    model: {
        getAccessToken: async (token: string): Promise<Token | null> => {
            // Mock token
            if (token === 'mock_token') {
                return {
                    accessToken: 'mock_token',
                    client: { id: 'client_id', grants: ['password'] },
                    user: { id: 'user_id' },
                    accessTokenExpiresAt: new Date(Date.now() + 10000), // 10 seconds expiry
                } as Token;
            }
            return null;
        },
        getClient: async (clientId: string, clientSecret: string): Promise<Client | null> => {
            // Mock client
            if (clientId === 'client_id' && clientSecret === 'client_secret') {
                return {
                    id: 'client_id',
                    grants: ['password'],
                } as Client;
            }
            return null;
        },
        saveToken: async (token: Token, client: Client, user: any): Promise<Token> => {
            // Mock saving token
            return {
                accessToken: 'mock_token',
                client: { id: 'client_id', grants: ['password'] },
                user: { id: 'user_id' },
                accessTokenExpiresAt: new Date(Date.now() + 10000), // 10 seconds expiry
            } as Token;
        },
        getUser: async (username: string, password: string): Promise<any> => {
            // Mock user
            if (username === 'user' && password === 'password') {
                return { id: 'user_id' };
            }
            return null;
        },
        verifyScope: async (token: Token, scope: string | string[]): Promise<boolean> => {
            // Mock scope verification
            return true;
        },
    },
});

app.post('/oauth/token', async (req: Request, res: Response) => {
    const request = new OAuthRequest(req);
    const response = new OAuthResponse(res);
    try {
        const token = await oauth.token(request, response);
        res.json(token);
    } catch (err: any) {
        res.status(err.code || 500).json(err);
    }
});

app.listen(3500, () => {
    console.log('OAuth2 mock server is running on port 3000');
});