"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminAppsService, adminGlobalNetworksService, adminUsersService,
  adminLimitRequestsService, adminEmailsService, adminAnalyticsService,
  adminApiDocsService, adminPagesService,
} from "@/services";
import { queryKeys } from "@/lib/query-client";
import type {
  SuspendAppInput, ToggleUserStatusInput, SetAppLimitInput,
  SendEmailInput, BroadcastEmailInput, ReviewLimitRequestInput,
  UpdateStaticPageInput, CreateApiDocInput, CreateGlobalNetworkInput,
} from "@/types";

// ── Apps ──────────────────────────────────────────────────────────

export function useAdminApps() {
  return useQuery({ queryKey: queryKeys.adminApps(), queryFn: adminAppsService.listApps });
}

export function useAdminApp(id: number | string) {
  return useQuery({ queryKey: queryKeys.adminApp(id), queryFn: () => adminAppsService.getApp(id), enabled: !!id });
}

export function useAdminSuspendApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: SuspendAppInput }) =>
      adminAppsService.suspendApp(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminApps() }); toast.success("App suspended."); },
  });
}

export function useAdminUnsuspendApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminAppsService.unsuspendApp(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminApps() }); toast.success("App reinstated."); },
  });
}

export function useAdminRotateKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminAppsService.rotateKey(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: queryKeys.adminApp(id) }),
  });
}

// ── Global Networks ───────────────────────────────────────────────

export function useAdminGlobalNetworks() {
  return useQuery({ queryKey: queryKeys.adminGlobalNetworks(), queryFn: adminGlobalNetworksService.listNetworks });
}

export function useAdminCreateNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGlobalNetworkInput) => adminGlobalNetworksService.createNetwork(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminGlobalNetworks() }); toast.success("Network created."); },
  });
}

export function useAdminUpdateNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: Partial<CreateGlobalNetworkInput> }) =>
      adminGlobalNetworksService.updateNetwork(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminGlobalNetworks() }); toast.success("Network updated."); },
  });
}

export function useAdminToggleNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number | string; active: boolean }) =>
      adminGlobalNetworksService.toggleNetwork(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminGlobalNetworks() }),
  });
}

export function useAdminDeleteNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminGlobalNetworksService.deleteNetwork(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.adminGlobalNetworks() }); toast.success("Network deleted."); },
  });
}

// ── Users ─────────────────────────────────────────────────────────

export function useAdminUsers(params?: { search?: string; status?: "active" | "inactive" }) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params?.search, params?.status),
    queryFn: () => adminUsersService.listUsers(params),
  });
}

export function useAdminUser(id: number | string) {
  return useQuery({ queryKey: queryKeys.adminUser(id), queryFn: () => adminUsersService.getUser(id), enabled: !!id });
}

export function useAdminToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: ToggleUserStatusInput }) =>
      adminUsersService.toggleUserStatus(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User status updated."); },
  });
}

export function useAdminSetAppLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: SetAppLimitInput }) =>
      adminUsersService.setAppLimit(id, input),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: queryKeys.adminUser(id) }); toast.success("App limit updated."); },
  });
}

export function useAdminSendEmail() {
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: SendEmailInput }) =>
      adminUsersService.sendEmail(id, input),
    onSuccess: () => toast.success("Email sent."),
  });
}

// ── Limit Requests ────────────────────────────────────────────────

export function useAdminLimitRequests(status?: "pending" | "approved" | "rejected") {
  return useQuery({
    queryKey: queryKeys.adminLimitRequests(status),
    queryFn: () => adminLimitRequestsService.listRequests(status),
  });
}

export function useAdminApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input?: ReviewLimitRequestInput }) =>
      adminLimitRequestsService.approveRequest(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "limit-requests"] }); toast.success("Request approved."); },
  });
}

export function useAdminRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input?: ReviewLimitRequestInput }) =>
      adminLimitRequestsService.rejectRequest(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "limit-requests"] }); toast.success("Request rejected."); },
  });
}

// ── Emails ────────────────────────────────────────────────────────

export function useAdminEmailLogs(userId?: number | string) {
  return useQuery({ queryKey: queryKeys.adminEmails(userId), queryFn: () => adminEmailsService.getLogs(userId) });
}

export function useAdminBroadcast() {
  return useMutation({
    mutationFn: (input: BroadcastEmailInput) => adminEmailsService.broadcast(input),
    onSuccess: () => toast.success("Broadcast sent to all active developers."),
  });
}

// ── Analytics ─────────────────────────────────────────────────────

export function useAdminStats(appId: number | string, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.adminAnalytics(appId, from, to),
    queryFn: () => adminAnalyticsService.getStats(appId, from, to),
    enabled: !!appId,
  });
}

// ── API Docs ──────────────────────────────────────────────────────

export function useAdminApiDocs(category?: string) {
  return useQuery({ queryKey: queryKeys.adminApiDocs(category), queryFn: () => adminApiDocsService.listDocs(category) });
}

export function useAdminCreateDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApiDocInput) => adminApiDocsService.createDoc(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "api-docs"] }); toast.success("Doc created."); },
  });
}

export function useAdminUpdateDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: Partial<CreateApiDocInput> & { is_published?: boolean } }) =>
      adminApiDocsService.updateDoc(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "api-docs"] }); toast.success("Doc updated."); },
  });
}

export function useAdminDeleteDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminApiDocsService.deleteDoc(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "api-docs"] }); toast.success("Doc deleted."); },
  });
}

// ── Static Pages ──────────────────────────────────────────────────

export function useAdminPages() {
  return useQuery({ queryKey: queryKeys.adminPages(), queryFn: adminPagesService.listPages });
}

export function useAdminPage(key: string) {
  return useQuery({ queryKey: queryKeys.adminPage(key), queryFn: () => adminPagesService.getPage(key), enabled: !!key });
}

export function useAdminUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateStaticPageInput }) =>
      adminPagesService.updatePage(key, input),
    onSuccess: (_, { key }) => { qc.invalidateQueries({ queryKey: queryKeys.adminPage(key) }); toast.success("Page saved."); },
  });
}
