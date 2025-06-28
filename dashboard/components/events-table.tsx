"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActivityEvent } from "@/lib/api-client";

interface EventsTableProps {
  events: ActivityEvent[];
  loading?: boolean;
  error?: string | null;
}

export function EventsTable({
  events,
  loading = false,
  error = null,
}: EventsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (eventId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedRows(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return null;

    if (score < 20) {
      return (
        <Badge className="bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20">
          Low ({score})
        </Badge>
      );
    }
    if (score < 50) {
      return (
        <Badge className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20">
          Medium ({score})
        </Badge>
      );
    }
    return (
      <Badge className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20">
        High ({score})
      </Badge>
    );
  };

  const getDirectionBadge = (direction: "request" | "response") => {
    return (
      <Badge
        variant="outline"
        className={
          direction === "request"
            ? "border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6] bg-opacity-10"
            : "border-[#10B981] text-[#10B981] bg-[#10B981] bg-opacity-10"
        }
      >
        {direction}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9]"></div>
        <p className="mt-2 text-[rgba(250,250,250,0.7)]">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#EF4444] mb-2">Failed to load events</p>
        <p className="text-sm text-[rgba(250,250,250,0.7)]">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[rgba(250,250,250,0.7)] mb-2">No events found</p>
        <p className="text-sm text-[rgba(250,250,250,0.5)]">
          Run your CLI to start generating events or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[rgba(250,250,250,0.1)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[rgba(250,250,250,0.1)] hover:bg-[rgba(250,250,250,0.02)]">
              <TableHead className="text-[rgba(250,250,250,0.7)] w-[50px]"></TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Timestamp
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Direction
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Method
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Payload Preview
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Size
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Risk Score
              </TableHead>
              <TableHead className="text-[rgba(250,250,250,0.7)]">
                Cost
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <>
                <TableRow
                  key={event.id}
                  className="border-b border-[rgba(250,250,250,0.1)] hover:bg-[rgba(250,250,250,0.02)] cursor-pointer"
                  onClick={() => toggleRow(event.id)}
                >
                  <TableCell>
                    {expandedRows.has(event.id) ? (
                      <ChevronDown className="w-4 h-4 text-[rgba(250,250,250,0.7)]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[rgba(250,250,250,0.7)]" />
                    )}
                  </TableCell>
                  <TableCell className="text-[#FAFAFA] font-mono text-sm">
                    <div title={new Date(event.timestamp).toLocaleString()}>
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>{getDirectionBadge(event.direction)}</TableCell>
                  <TableCell className="text-[#FAFAFA] font-mono text-sm">
                    {event.method || "response"}
                  </TableCell>
                  <TableCell className="text-[rgba(250,250,250,0.7)] font-mono text-sm max-w-xs truncate">
                    {event.payloadPreview}
                  </TableCell>
                  <TableCell className="text-[#FAFAFA] font-mono text-sm">
                    {formatSize(event.size)}
                  </TableCell>
                  <TableCell>
                    {event.riskScore ? (
                      getRiskBadge(event.riskScore)
                    ) : (
                      <span className="text-[rgba(250,250,250,0.5)] text-sm">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[#FAFAFA] font-mono text-sm">
                    {event.costEstimate
                      ? `$${event.costEstimate.toFixed(4)}`
                      : "—"}
                  </TableCell>
                </TableRow>

                {expandedRows.has(event.id) && (
                  <TableRow key={`${event.id}-expanded`}>
                    <TableCell
                      colSpan={8}
                      className="bg-[rgba(250,250,250,0.02)] p-4"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[rgba(250,250,250,0.7)]">
                              Event ID:
                            </span>
                            <div className="text-[#FAFAFA] font-mono break-all">
                              {event.id}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(event.id);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-[rgba(250,250,250,0.7)]">
                              Source:
                            </span>
                            <div className="text-[#FAFAFA] font-mono">
                              {event.source}
                            </div>
                          </div>
                          <div>
                            <span className="text-[rgba(250,250,250,0.7)]">
                              Processed At:
                            </span>
                            <div className="text-[#FAFAFA] font-mono">
                              {new Date(event.processedAt).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-[rgba(250,250,250,0.7)]">
                              Full Timestamp:
                            </span>
                            <div className="text-[#FAFAFA] font-mono">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[rgba(250,250,250,0.7)]">
                            Payload Preview:
                          </span>
                          <div className="mt-2 p-3 bg-[rgba(0,0,0,0.3)] rounded-md border border-[rgba(250,250,250,0.1)]">
                            <pre className="text-[#FAFAFA] font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
                              {event.payloadPreview}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[rgba(250,250,250,0.7)]">
          Showing {events.length} events
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] bg-transparent"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
