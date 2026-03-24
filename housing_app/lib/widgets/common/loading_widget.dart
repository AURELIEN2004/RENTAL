/// ============================================
// lib/widgets/commmon/loading_widget.dart
// ============================================

import 'package:flutter/material.dart';

class LoadingWidget extends StatelessWidget {
  final String message;
  final bool fullScreen;

  const LoadingWidget({
    Key? key,
    this.message = 'Chargement...',
    this.fullScreen = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final content = Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );

    if (fullScreen) {
      return Scaffold(
        body: content,
      );
    }

    return content;
  }
}