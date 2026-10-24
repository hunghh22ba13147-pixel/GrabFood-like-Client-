import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DishOption } from '../../models/types';
import { colors, formatVND, radius, spacing } from '../../theme';
import { SelectedOption } from './restaurantMenuTypes';

interface OptionGroupSectionProps {
  option: DishOption;
  selectedOptions: SelectedOption[];
  onToggle: (optionId: string, choiceId: string, multiple: boolean) => void;
}

export default function OptionGroupSection({
  option,
  selectedOptions,
  onToggle,
}: OptionGroupSectionProps) {
  const selected = selectedOptions.find((item) => item.optionId === option.id);
  const selectedIds = selected?.choiceIds ?? [];

  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <Text style={styles.title}>{option.name}</Text>
        <Text style={styles.badge}>{option.required ? 'Bắt buộc' : 'Tùy chọn'}</Text>
      </View>
      {option.choices.map((choice) => {
        const checked = selectedIds.includes(choice.id);
        return (
          <Pressable
            key={choice.id}
            style={styles.choice}
            onPress={() => onToggle(option.id, choice.id, option.multiple)}
          >
            <Ionicons
              name={
                option.multiple
                  ? checked
                    ? 'checkbox'
                    : 'square-outline'
                  : checked
                    ? 'radio-button-on'
                    : 'radio-button-off'
              }
              size={22}
              color={checked ? colors.primary : colors.muted}
            />
            <Text style={styles.choiceName}>{choice.name}</Text>
            <Text style={styles.extra}>
              {choice.price > 0 ? `+${formatVND(choice.price)}` : 'Miễn phí'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontWeight: '700', fontSize: 16, color: colors.text },
  badge: { color: colors.muted, fontSize: 12 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  choiceName: { flex: 1, color: colors.text, fontSize: 15 },
  extra: { color: colors.muted, fontSize: 13 },
});
