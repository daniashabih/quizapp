import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/constants/tech_logo_registry.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/widgets/tech_logo_widget.dart';

void main() {
  const seededAndPromptCategories = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Angular',
    'Vue',
    'Node.js',
    'Express.js',
    'MongoDB',
    'SQL',
    'SQL Server',
    'PHP',
    'Laravel',
    'Python',
    'Django',
    'Flutter',
    'Dart',
    'Git',
    'GitHub',
    'Tailwind CSS',
    'Bootstrap',
    'WordPress',
    'Docker',
    'Agile and DevOps',
    'Agile & DevOps',
    'Agile Characteristics',
    'Azure',
    'SEO',
    'Express JS and Node JS',
    'Power BI',
    'Excel',
    'PHP, XML JSON, Laravel, MySQL, JavaScript',
    'C#',
    'HTML & CSS',
  ];

  group('TechLogoRegistry', () {
    test('resolves all seeded and combined Hangbug categories', () {
      for (final category in seededAndPromptCategories) {
        final logos = TechLogoRegistry.resolve(category);
        expect(logos, isNotEmpty, reason: 'Expected logos for "$category"');
      }

      expect(
        TechLogoRegistry.resolve('HTML & CSS').map((e) => e.id).toList(),
        equals(['html5', 'css3']),
      );
      expect(
        TechLogoRegistry.resolve('Express JS and Node JS')
            .map((e) => e.id)
            .toList(),
        equals(['express', 'nodejs']),
      );
      expect(
        TechLogoRegistry.resolve('PHP, XML JSON, Laravel, MySQL, JavaScript')
            .map((e) => e.id)
            .toList(),
        equals(['php', 'xml', 'json', 'laravel', 'mysql', 'javascript']),
      );
      expect(
        TechLogoRegistry.resolve('Microsoft Azure').map((e) => e.id).toList(),
        equals(['azure']),
      );
      expect(
        TechLogoRegistry.resolve('Power BI').map((e) => e.id).toList(),
        equals(['powerbi']),
      );
      expect(
        TechLogoRegistry.resolve('Unknown Custom Topic'),
        isEmpty,
      );
    });
  });

  group('TechLogoWidget rendering', () {
    testWidgets(
      'renders single, dual, multi-logo (6 icons), and fallback cleanly at 360dp width without overflow',
      (tester) async {
        tester.view.physicalSize = const Size(360, 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() {
          tester.view.resetPhysicalSize();
          tester.view.resetDevicePixelRatio();
        });

        await tester.pumpWidget(
          MaterialApp(
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.dark,
            home: Scaffold(
              body: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(
                    width: 92,
                    child: TechLogoWidget(
                      name: 'PHP, XML JSON, Laravel, MySQL, JavaScript',
                      size: 44,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: const [
                      TechLogoWidget(name: 'Express JS and Node JS', size: 48),
                      SizedBox(width: 14),
                      Expanded(child: Text('Express JS and Node JS')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: const [
                      TechLogoWidget(name: 'Dart', size: 48),
                      SizedBox(width: 14),
                      Expanded(child: Text('Dart')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const TechLogoWidget(name: 'Completely Unknown Tech', size: 44),
                ],
              ),
            ),
          ),
        );

        await tester.pump();

        expect(tester.takeException(), isNull);
        expect(find.byType(SvgPicture), findsNWidgets(9)); // 6 + 2 + 1
        expect(find.byIcon(Icons.code_rounded), findsOneWidget);
      },
    );
  });
}
