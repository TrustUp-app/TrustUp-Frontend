import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useReputation, REPUTATION_TIER_LABELS } from '../../hooks/reputation/use-reputation';
import { formatLoanAmount } from '../../hooks/loans/use-loans';
import type { ReputationTier } from '../../types/api';

const colors = require('../../theme/colors.json');

// ─── Gauge ────────────────────────────────────────────────────────────────────

const GAUGE_WIDTH = 240;
const GAUGE_HEIGHT = 140;
const GAUGE_CENTER_X = GAUGE_WIDTH / 2;
const GAUGE_CENTER_Y = 120;
const GAUGE_RADIUS = 100;
const GAUGE_STROKE = 16;

/** Badge colors per backend tier (gold/silver/bronze/poor). */
const TIER_COLORS: Record<ReputationTier, string> = {
  gold: '#D4AF37',
  silver: '#9CA3AF',
  bronze: '#CD7F32',
  poor: colors.error,
};

/** Score-zone color for the gauge arc: red 0–39, yellow 40–69, green 70–100. */
const getScoreZoneColor = (score: number): string => {
  if (score < 40) return colors.error;
  if (score < 70) return colors.amber;
  return colors.successDeep;
};

/**
 * Converts a score fraction (0–1) to a point on the semicircular arc.
 * The arc sweeps from 180° (left) over the top to 0° (right).
 */
const pointOnArc = (fraction: number) => {
  const clamped = Math.min(Math.max(fraction, 0), 1);
  const theta = Math.PI * (1 - clamped); // radians: π (left) → 0 (right)
  return {
    x: GAUGE_CENTER_X + GAUGE_RADIUS * Math.cos(theta),
    y: GAUGE_CENTER_Y - GAUGE_RADIUS * Math.sin(theta),
  };
};

const arcPath = (fromFraction: number, toFraction: number) => {
  const start = pointOnArc(fromFraction);
  const end = pointOnArc(toFraction);
  const sweptDegrees = (toFraction - fromFraction) * 180;
  const largeArc = sweptDegrees > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const ReputationGauge = ({ score, tier }: { score: number; tier: ReputationTier }) => {
  const fraction = Math.min(Math.max(score / 100, 0), 1);
  const zoneColor = getScoreZoneColor(score);
  const needle = pointOnArc(fraction);

  return (
    <View className="items-center">
      <Svg width={GAUGE_WIDTH} height={GAUGE_HEIGHT}>
        {/* Color-zone track: red 0–39, yellow 40–69, green 70–100 */}
        <Path
          d={arcPath(0, 0.4)}
          stroke={colors.errorSoft}
          strokeWidth={GAUGE_STROKE}
          fill="none"
        />
        <Path
          d={arcPath(0.4, 0.7)}
          stroke={colors.amberSoft}
          strokeWidth={GAUGE_STROKE}
          fill="none"
        />
        <Path
          d={arcPath(0.7, 1)}
          stroke={colors.successBadge}
          strokeWidth={GAUGE_STROKE}
          fill="none"
        />

        {/* Progress arc up to the current score */}
        <Path
          d={arcPath(0, fraction)}
          stroke={zoneColor}
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          fill="none"
        />

        {/* Needle head */}
        <Circle
          cx={needle.x}
          cy={needle.y}
          r={9}
          fill={colors.white}
          stroke={zoneColor}
          strokeWidth={4}
        />
      </Svg>

      {/* Score readout overlaps the gauge center */}
      <View className="-mt-20 items-center">
        <View className="flex-row items-end">
          <Text className="text-5xl font-bold text-primary">{score}</Text>
          <Text className="mb-1 text-xl text-textMuted">/100</Text>
        </View>
        <View
          className="mt-1 rounded-full px-3 py-1"
          style={{ backgroundColor: `${TIER_COLORS[tier]}22` }}>
          <Text className="text-xs font-semibold" style={{ color: TIER_COLORS[tier] }}>
            {REPUTATION_TIER_LABELS[tier]}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const DetailRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-borderSubtle'}`}>
    <Text className="text-sm text-textMuted">{label}</Text>
    <Text className="text-sm font-semibold text-textStrong">{value}</Text>
  </View>
);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface ReputationScreenProps {
  onBack: () => void;
}

const ReputationScreen: React.FC<ReputationScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { reputation, isLoading, error, refresh } = useReputation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.white,
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-white">
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">Reputation</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Error banner */}
        {error && (
          <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-errorSoft px-4 py-3">
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text className="flex-1 text-sm text-error">{error}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text className="text-sm font-semibold text-error">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {isLoading && !reputation && (
          <View className="items-center py-24">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {reputation && (
          <>
            {/* Gauge card */}
            <View className="mb-4 items-center rounded-2xl bg-white p-6 shadow-sm">
              <ReputationGauge score={reputation.score} tier={reputation.tier} />
              <Text className="mt-3 text-center text-xs text-textMuted">
                Higher score = more credit • Up to {formatLoanAmount(reputation.maxCredit)}
              </Text>
            </View>

            {/* Details card (real fields from the API) */}
            <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
              <Text className="mb-2 text-base font-bold text-textStrong">Details</Text>
              <DetailRow label="Tier" value={REPUTATION_TIER_LABELS[reputation.tier]} />
              <DetailRow label="Interest rate" value={`${reputation.interestRate}%`} />
              <DetailRow label="Credit limit" value={formatLoanAmount(reputation.maxCredit)} />
              <DetailRow label="Last updated" value={formatDate(reputation.lastUpdated)} isLast />
            </View>

            {/* Neutral state: the API does not expose a score history / category
                breakdown, so we show a placeholder instead of inventing data. */}
            <View className="rounded-2xl bg-white p-6 shadow-sm">
              <Text className="mb-1 text-base font-bold text-textStrong">Score history</Text>
              <Text className="text-sm text-textMuted">
                Detailed score history isn&apos;t available yet. Your reputation updates on-chain as
                you repay loans on time.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ReputationScreen;
