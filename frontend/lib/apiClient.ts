"use client";

export interface ApiEnvelope<T> {
	success: boolean;
	data: T;
	error: {
		code: string;
		message: string;
		details?: unknown;
	} | null;
	meta?: Record<string, unknown>;
}

export class ApiError extends Error {
	status: number;
	code?: string;
	details?: unknown;

	constructor(message: string, status: number, code?: string, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "claimheart.api.accessToken";
const REFRESH_TOKEN_KEY = "claimheart.api.refreshToken";

const hasWindow = () => typeof window !== "undefined";

export const getApiBaseUrl = () => API_BASE_URL;

export const getStoredAccessToken = () => {
	if (!hasWindow()) {
		return null;
	}

	return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAuthTokens = (tokens: { accessToken: string; refreshToken?: string | null }) => {
	if (!hasWindow()) {
		return;
	}

	window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
	if (tokens.refreshToken) {
		window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
	}
};

export const clearAuthTokens = () => {
	if (!hasWindow()) {
		return;
	}

	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const apiRequest = async <T>(
	path: string,
	init: RequestInit = {},
	requireAuth: boolean = false,
): Promise<T> => {
	const headers = new Headers(init.headers || {});
	if (!headers.has("Content-Type") && init.body) {
		headers.set("Content-Type", "application/json");
	}
	headers.set("Accept", "application/json");

	if (requireAuth) {
		const accessToken = getStoredAccessToken();
		if (accessToken) {
			headers.set("Authorization", `Bearer ${accessToken}`);
		}
	}

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers,
			cache: "no-store",
		});
	} catch {
		throw new ApiError("Unable to reach backend API. Please verify the backend server is running.", 0);
	}

	let payload: ApiEnvelope<T> | null = null;
	try {
		payload = (await response.json()) as ApiEnvelope<T>;
	} catch {
		payload = null;
	}

	if (!response.ok || !payload?.success) {
		const message = payload?.error?.message || `Request failed with status ${response.status}`;
		throw new ApiError(message, response.status, payload?.error?.code, payload?.error?.details);
	}

	return payload.data;
};
