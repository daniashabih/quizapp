import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/category_model.dart';
import '../../providers/admin_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_state_widget.dart';
import '../../widgets/loading_state_widget.dart';

class AdminCategoriesScreen extends ConsumerWidget {
  const AdminCategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Categories'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(categoriesProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Category'),
        onPressed: () => _openAddCategoryDialog(context, ref),
      ),
      body: categoriesAsync.when(
        loading: () => const LoadingStateWidget(message: 'Loading categories...'),
        error: (err, stack) => ErrorStateWidget(
          message: 'Failed to load categories: ${err.toString()}',
          onRetry: () => ref.invalidate(categoriesProvider),
        ),
        data: (categories) {
          if (categories.isEmpty) {
            return EmptyStateWidget(
              icon: Icons.category_outlined,
              title: 'No Categories',
              description: 'Create your first technology quiz category.',
              actionText: 'Add Category',
              onAction: () => _openAddCategoryDialog(context, ref),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(categoriesProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: categories.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final cat = categories[index];
                return _buildCategoryTile(context, ref, cat);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryTile(BuildContext context, WidgetRef ref, CategoryModel cat) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: cat.isEnabled ? AppColors.border : AppColors.error.withValues(alpha: 0.3),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: cat.isEnabled
                ? AppColors.primary.withValues(alpha: 0.1)
                : Colors.grey.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Text(
            cat.name.isNotEmpty ? cat.name.substring(0, 1).toUpperCase() : 'C',
            style: AppTextStyles.displaySmall.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: cat.isEnabled ? AppColors.primary : Colors.grey,
            ),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                cat.name,
                style: AppTextStyles.labelBold.copyWith(
                  fontSize: 16,
                  color: cat.isEnabled ? AppColors.textPrimary : AppColors.textSecondary,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: cat.isEnabled
                    ? AppColors.success.withValues(alpha: 0.12)
                    : Colors.red.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                cat.isEnabled ? 'ACTIVE' : 'DISABLED',
                style: AppTextStyles.mono.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: cat.isEnabled ? AppColors.success : Colors.red,
                ),
              ),
            ),
          ],
        ),
        subtitle: Text(
          '${cat.totalQuestions} questions across ${cat.sessions.length} sessions',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Switch(
              value: cat.isEnabled,
              activeThumbColor: AppColors.primary,
              activeTrackColor: AppColors.primary.withValues(alpha: 0.38),
              onChanged: (val) async {
                final success = await ref.read(adminControllerProvider.notifier).toggleCategoryStatus(cat.id, val);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success
                          ? 'Category "${cat.name}" is now ${val ? "Enabled" : "Disabled"}.'
                          : 'Failed to update category status.'),
                      backgroundColor: success ? AppColors.success : AppColors.error,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              tooltip: 'Delete Category',
              onPressed: () => _confirmDeleteCategory(context, ref, cat),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteCategory(BuildContext context, WidgetRef ref, CategoryModel cat) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Category?'),
        content: Text('Are you sure you want to delete "${cat.name}" and all its questions? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final success = await ref.read(adminControllerProvider.notifier).deleteCategory(cat.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Category deleted.' : 'Failed to delete category.'),
                    backgroundColor: success ? AppColors.success : AppColors.error,
                  ),
                );
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _openAddCategoryDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Add New Category'),
        content: Form(
          key: formKey,
          child: AppTextField(
            label: 'Category Name',
            controller: controller,
            hint: 'e.g. Flutter, Docker, TypeScript',
            validator: (v) => v?.trim().isEmpty == true ? 'Category name is required' : null,
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.of(ctx).pop();
              final success = await ref.read(adminControllerProvider.notifier).createCategory(controller.text.trim());
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Category created.' : 'Failed to create category.'),
                    backgroundColor: success ? AppColors.success : AppColors.error,
                  ),
                );
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}
