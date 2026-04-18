"use client";

import { useCallback } from "react";
import { getClaims } from "@/lib/api/claims";
import { useAppStore } from "@/store/useAppStore";

export const useClaims = () => {
	const claims = useAppStore((state) => state.claims);
	const loading = useAppStore((state) => state.claimsLoading);
	const error = useAppStore((state) => state.claimsError);

	const reload = useCallback(async () => {
		await getClaims();
	}, []);

	return {
		claims,
		loading,
		error,
		reload,
	};
};
