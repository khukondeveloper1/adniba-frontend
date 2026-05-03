"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  developerAuthService,
  developerAppsService,
  developerNetworksService,
  developerUnitsService,
  developerSettingsService,
  developerAnalyticsService,
  developerLimitRequestsService,
} from "@/services";
import { queryKeys } from "@/lib/query-client";
import type {
  CreateAppInput,
  UpdateAppInput,
  ToggleAppStatusInput,
  ToggleAdsEnabledInput,
  AddNetworkInput,
  ToggleNetworkInput,
  CreateAdUnitInput,
  UpdateAdUnitInput,
  ToggleAdUnitInput,
  UpsertAdSettingInput,
  SubmitLimitRequestInput,
  ApiResponseWithMeta,
  App,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: queryKeys.devMe(),
    queryFn: developerAuthService.me,
    staleTime: 60 * 1000,
  });
}

// ── Apps ──────────────────────────────────────────────────────────

export function useApps() {
  return useQuery({
    queryKey: queryKeys.devApps(),
    queryFn: developerAppsService.listApps,
  });
}

export function useApp(id: number | string) {
  return useQuery({
    queryKey: queryKeys.devApp(id),
    queryFn: () => developerAppsService.getApp(id),
    enabled: !!id,
  });
}

export function useCreateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, file }: { input: CreateAppInput; file?: File }) =>
      developerAppsService.createApp(input, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
      qc.invalidateQueries({ queryKey: queryKeys.devMe() });
      toast.success("App created successfully.");
    },
  });
}

export function useUpdateApp(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAppInput) => developerAppsService.updateApp(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApp(id) });
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
      toast.success("App updated.");
    },
  });
}

export function useDeleteApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => developerAppsService.deleteApp(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
      qc.invalidateQueries({ queryKey: queryKeys.devMe() });
      toast.success("App deleted.");
    },
  });
}

export function useRotateApiKey(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => developerAppsService.rotateApiKey(appId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
    },
  });
}

function patchAppInList(
  data: ApiResponseWithMeta<App[]> | undefined,
  appId: number | string,
  patch: Partial<App>,
): ApiResponseWithMeta<App[]> | undefined {
  if (!data) return data;

  return {
    ...data,
    data: data.data.map((app) =>
      app.id === Number(appId) ? { ...app, ...patch } : app,
    ),
  };
}

export function useToggleAppStatus(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleAppStatusInput) =>
      developerAppsService.toggleStatus(appId, input),
    onMutate: async (input) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: queryKeys.devApps() }),
        qc.cancelQueries({ queryKey: queryKeys.devApp(appId) }),
      ]);

      const previousApps = qc.getQueryData<ApiResponseWithMeta<App[]>>(
        queryKeys.devApps(),
      );
      const previousApp = qc.getQueryData<App>(queryKeys.devApp(appId));
      const status = input.active ? "active" : "inactive";
      const patch = { status, app_status: input.active, is_suspended: false } as Partial<App>;

      qc.setQueryData(queryKeys.devApps(), patchAppInList(previousApps, appId, patch));
      qc.setQueryData<App>(queryKeys.devApp(appId), (app) =>
        app ? { ...app, ...patch } : app,
      );

      return { previousApps, previousApp };
    },
    onError: (_err, _input, context) => {
      qc.setQueryData(queryKeys.devApps(), context?.previousApps);
      qc.setQueryData(queryKeys.devApp(appId), context?.previousApp);
      toast.error("Could not update app status.");
    },
    onSuccess: (app) => {
      qc.setQueryData(queryKeys.devApps(), (data: ApiResponseWithMeta<App[]> | undefined) =>
        patchAppInList(data, appId, app),
      );
      qc.setQueryData(queryKeys.devApp(appId), app);
      toast.success("App status updated.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
    },
  });
}

export function useToggleAdsEnabled(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleAdsEnabledInput) =>
      developerAppsService.toggleAdsEnabled(appId, input),
    onMutate: async (input) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: queryKeys.devApps() }),
        qc.cancelQueries({ queryKey: queryKeys.devApp(appId) }),
      ]);

      const previousApps = qc.getQueryData<ApiResponseWithMeta<App[]>>(
        queryKeys.devApps(),
      );
      const previousApp = qc.getQueryData<App>(queryKeys.devApp(appId));
      const patch = { global_ad_enabled: input.enabled } as Partial<App>;

      qc.setQueryData(queryKeys.devApps(), patchAppInList(previousApps, appId, patch));
      qc.setQueryData<App>(queryKeys.devApp(appId), (app) =>
        app ? { ...app, ...patch } : app,
      );

      return { previousApps, previousApp };
    },
    onError: (_err, _input, context) => {
      qc.setQueryData(queryKeys.devApps(), context?.previousApps);
      qc.setQueryData(queryKeys.devApp(appId), context?.previousApp);
      toast.error("Could not update global ads.");
    },
    onSuccess: (app) => {
      qc.setQueryData(queryKeys.devApps(), (data: ApiResponseWithMeta<App[]> | undefined) =>
        patchAppInList(data, appId, app),
      );
      qc.setQueryData(queryKeys.devApp(appId), app);
      toast.success("Global ads updated.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devApps() });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
    },
  });
}

export function useFetchFromPlayStore() {
  return useMutation({
    mutationFn: (url: string) => developerAppsService.fetchFromPlayStore(url),
  });
}

// ── Networks ──────────────────────────────────────────────────────

export function useAppNetworks(appId: number | string) {
  return useQuery({
    queryKey: queryKeys.appNetworks(appId),
    queryFn: () => developerNetworksService.listNetworks(appId),
    enabled: !!appId,
  });
}

export function useAddNetwork(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddNetworkInput) =>
      developerNetworksService.addNetwork(appId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appNetworks(appId) });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
      toast.success("Network added.");
    },
  });
}

export function useToggleNetwork(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ networkId, input }: { networkId: number | string; input: ToggleNetworkInput }) =>
      developerNetworksService.toggleNetwork(appId, networkId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appNetworks(appId) }),
  });
}

export function useDeleteNetwork(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (networkId: number | string) =>
      developerNetworksService.deleteNetwork(appId, networkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appNetworks(appId) });
      // Cascade: units for this network are deleted server-side
      qc.invalidateQueries({ queryKey: queryKeys.appUnits(appId) });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
      toast.success("Network removed.");
    },
  });
}

// ── Ad Units ──────────────────────────────────────────────────────

export function useAppUnits(appId: number | string) {
  return useQuery({
    queryKey: queryKeys.appUnits(appId),
    queryFn: () => developerUnitsService.listUnits(appId),
    enabled: !!appId,
  });
}

export function useCreateUnit(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdUnitInput) =>
      developerUnitsService.createUnit(appId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appUnits(appId) });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
      toast.success("Ad unit created.");
    },
  });
}

export function useUpdateUnit(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, input }: { unitId: number | string; input: UpdateAdUnitInput }) =>
      developerUnitsService.updateUnit(appId, unitId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appUnits(appId) });
      toast.success("Ad unit updated.");
    },
  });
}

export function useToggleUnit(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, input }: { unitId: number | string; input: ToggleAdUnitInput }) =>
      developerUnitsService.toggleUnit(appId, unitId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appUnits(appId) }),
  });
}

export function useDeleteUnit(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unitId: number | string) =>
      developerUnitsService.deleteUnit(appId, unitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appUnits(appId) });
      qc.invalidateQueries({ queryKey: queryKeys.devApp(appId) });
      toast.success("Ad unit deleted.");
    },
  });
}

// ── Settings ──────────────────────────────────────────────────────

export function useAppSettings(appId: number | string) {
  return useQuery({
    queryKey: queryKeys.appSettings(appId),
    queryFn: () => developerSettingsService.listSettings(appId),
    enabled: !!appId,
  });
}

export function useUpsertSetting(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertAdSettingInput) =>
      developerSettingsService.upsertSetting(appId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appSettings(appId) });
      toast.success("Ad setting saved.");
    },
  });
}

export function useDeleteSetting(appId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settingId: number | string) =>
      developerSettingsService.deleteSetting(appId, settingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appSettings(appId) });
      toast.success("Setting reset to default.");
    },
  });
}

// ── Analytics ─────────────────────────────────────────────────────

export function useAppStats(appId: number | string, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.appStats(appId, from, to),
    queryFn: () => developerAnalyticsService.getStats(appId, from, to),
    enabled: !!appId,
  });
}

// ── Limit Requests ────────────────────────────────────────────────

export function useDevLimitRequests() {
  return useQuery({
    queryKey: queryKeys.devLimitRequests(),
    queryFn: developerLimitRequestsService.listRequests,
  });
}

export function useSubmitLimitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitLimitRequestInput) =>
      developerLimitRequestsService.submitRequest(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.devLimitRequests() });
      toast.success("Limit increase request submitted.");
    },
  });
}
