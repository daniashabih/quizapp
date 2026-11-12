/// Canonical technology logo asset metadata.
class TechLogoAsset {
  const TechLogoAsset({
    required this.id,
    required this.label,
    required this.assetPath,
    this.darkInk = false,
    this.lightBacking = false,
  });

  final String id;
  final String label;
  final String assetPath;

  /// True for monochrome dark SVGs that should invert to light ink on dark surfaces.
  final bool darkInk;

  /// True for mixed SVGs (e.g. Next.js, AWS) that contain dark primary shapes
  /// alongside white/orange accents and need a light inner backing in dark mode.
  final bool lightBacking;
}

/// Centralized, scalable technology-logo mapping system for Hangbug Mobile.
/// Mirrors `src/utils/techLogos.js` on Web so both platforms render identical logos.
class TechLogoRegistry {
  TechLogoRegistry._();

  static const String _assetPrefix = 'assets/tech_logos';

  static const Map<String, TechLogoAsset> catalog = {
    'android': TechLogoAsset(id: 'android', label: 'Android', assetPath: '$_assetPrefix/android.svg'),
    'angular': TechLogoAsset(id: 'angular', label: 'Angular', assetPath: '$_assetPrefix/angular.svg'),
    'aws': TechLogoAsset(id: 'aws', label: 'AWS', assetPath: '$_assetPrefix/aws.svg', lightBacking: true),
    'azure': TechLogoAsset(id: 'azure', label: 'Microsoft Azure', assetPath: '$_assetPrefix/azure.svg'),
    'bootstrap': TechLogoAsset(id: 'bootstrap', label: 'Bootstrap', assetPath: '$_assetPrefix/bootstrap.svg'),
    'c': TechLogoAsset(id: 'c', label: 'C', assetPath: '$_assetPrefix/c.svg'),
    'cplusplus': TechLogoAsset(id: 'cplusplus', label: 'C++', assetPath: '$_assetPrefix/cplusplus.svg'),
    'csharp': TechLogoAsset(id: 'csharp', label: 'C#', assetPath: '$_assetPrefix/csharp.svg'),
    'css3': TechLogoAsset(id: 'css3', label: 'CSS3', assetPath: '$_assetPrefix/css3.svg'),
    'dart': TechLogoAsset(id: 'dart', label: 'Dart', assetPath: '$_assetPrefix/dart.svg'),
    'devops': TechLogoAsset(id: 'devops', label: 'Agile & DevOps', assetPath: '$_assetPrefix/devops.svg'),
    'django': TechLogoAsset(id: 'django', label: 'Django', assetPath: '$_assetPrefix/django.svg', darkInk: true),
    'docker': TechLogoAsset(id: 'docker', label: 'Docker', assetPath: '$_assetPrefix/docker.svg'),
    'excel': TechLogoAsset(id: 'excel', label: 'Microsoft Excel', assetPath: '$_assetPrefix/excel.svg'),
    'express': TechLogoAsset(id: 'express', label: 'Express.js', assetPath: '$_assetPrefix/express.svg', darkInk: true),
    'firebase': TechLogoAsset(id: 'firebase', label: 'Firebase', assetPath: '$_assetPrefix/firebase.svg'),
    'flutter': TechLogoAsset(id: 'flutter', label: 'Flutter', assetPath: '$_assetPrefix/flutter.svg'),
    'git': TechLogoAsset(id: 'git', label: 'Git', assetPath: '$_assetPrefix/git.svg'),
    'github': TechLogoAsset(id: 'github', label: 'GitHub', assetPath: '$_assetPrefix/github.svg', darkInk: true),
    'go': TechLogoAsset(id: 'go', label: 'Go', assetPath: '$_assetPrefix/go.svg'),
    'graphql': TechLogoAsset(id: 'graphql', label: 'GraphQL', assetPath: '$_assetPrefix/graphql.svg'),
    'html5': TechLogoAsset(id: 'html5', label: 'HTML5', assetPath: '$_assetPrefix/html5.svg'),
    'java': TechLogoAsset(id: 'java', label: 'Java', assetPath: '$_assetPrefix/java.svg'),
    'javascript': TechLogoAsset(id: 'javascript', label: 'JavaScript', assetPath: '$_assetPrefix/javascript.svg'),
    'jquery': TechLogoAsset(id: 'jquery', label: 'jQuery', assetPath: '$_assetPrefix/jquery.svg'),
    'json': TechLogoAsset(id: 'json', label: 'JSON', assetPath: '$_assetPrefix/json.svg'),
    'kotlin': TechLogoAsset(id: 'kotlin', label: 'Kotlin', assetPath: '$_assetPrefix/kotlin.svg'),
    'kubernetes': TechLogoAsset(id: 'kubernetes', label: 'Kubernetes', assetPath: '$_assetPrefix/kubernetes.svg'),
    'laravel': TechLogoAsset(id: 'laravel', label: 'Laravel', assetPath: '$_assetPrefix/laravel.svg'),
    'linux': TechLogoAsset(id: 'linux', label: 'Linux', assetPath: '$_assetPrefix/linux.svg', darkInk: true),
    'mongodb': TechLogoAsset(id: 'mongodb', label: 'MongoDB', assetPath: '$_assetPrefix/mongodb.svg'),
    'mysql': TechLogoAsset(id: 'mysql', label: 'MySQL', assetPath: '$_assetPrefix/mysql.svg'),
    'nextjs': TechLogoAsset(id: 'nextjs', label: 'Next.js', assetPath: '$_assetPrefix/nextjs.svg', lightBacking: true),
    'nodejs': TechLogoAsset(id: 'nodejs', label: 'Node.js', assetPath: '$_assetPrefix/nodejs.svg'),
    'php': TechLogoAsset(id: 'php', label: 'PHP', assetPath: '$_assetPrefix/php.svg'),
    'postgresql': TechLogoAsset(id: 'postgresql', label: 'PostgreSQL', assetPath: '$_assetPrefix/postgresql.svg'),
    'powerbi': TechLogoAsset(id: 'powerbi', label: 'Power BI', assetPath: '$_assetPrefix/powerbi.svg'),
    'python': TechLogoAsset(id: 'python', label: 'Python', assetPath: '$_assetPrefix/python.svg'),
    'react': TechLogoAsset(id: 'react', label: 'React', assetPath: '$_assetPrefix/react.svg'),
    'rust': TechLogoAsset(id: 'rust', label: 'Rust', assetPath: '$_assetPrefix/rust.svg', darkInk: true),
    'seo': TechLogoAsset(id: 'seo', label: 'SEO', assetPath: '$_assetPrefix/seo.svg'),
    'sql': TechLogoAsset(id: 'sql', label: 'SQL', assetPath: '$_assetPrefix/sql.svg'),
    'sqlserver': TechLogoAsset(id: 'sqlserver', label: 'SQL Server', assetPath: '$_assetPrefix/sqlserver.svg'),
    'swift': TechLogoAsset(id: 'swift', label: 'Swift', assetPath: '$_assetPrefix/swift.svg'),
    'tailwindcss': TechLogoAsset(id: 'tailwindcss', label: 'Tailwind CSS', assetPath: '$_assetPrefix/tailwindcss.svg'),
    'typescript': TechLogoAsset(id: 'typescript', label: 'TypeScript', assetPath: '$_assetPrefix/typescript.svg'),
    'vuejs': TechLogoAsset(id: 'vuejs', label: 'Vue.js', assetPath: '$_assetPrefix/vuejs.svg'),
    'wordpress': TechLogoAsset(id: 'wordpress', label: 'WordPress', assetPath: '$_assetPrefix/wordpress.svg', darkInk: true),
    'xml': TechLogoAsset(id: 'xml', label: 'XML', assetPath: '$_assetPrefix/xml.svg'),
  };

  static const Map<String, List<String>> _compositeAliases = {
    'agile and devops': ['devops'],
    'agile & devops': ['devops'],
    'agile devops': ['devops'],
    'agile characteristics': ['devops'],
    'agile': ['devops'],
    'scrum': ['devops'],
    'devops': ['devops'],
    'ci/cd': ['devops'],
    'cicd': ['devops'],
    'microsoft azure': ['azure'],
    'ms azure': ['azure'],
    'azure': ['azure'],
    'amazon web services': ['aws'],
    'aws': ['aws'],
    'microsoft excel': ['excel'],
    'ms excel': ['excel'],
    'excel': ['excel'],
    'power bi': ['powerbi'],
    'powerbi': ['powerbi'],
    'microsoft power bi': ['powerbi'],
    'sql server': ['sqlserver'],
    'mssql': ['sqlserver'],
    'ms sql': ['sqlserver'],
    'ms sql server': ['sqlserver'],
    'microsoft sql server': ['sqlserver'],
    'tailwind css': ['tailwindcss'],
    'tailwind': ['tailwindcss'],
    'tailwindcss': ['tailwindcss'],
    'express js': ['express'],
    'express.js': ['express'],
    'expressjs': ['express'],
    'express': ['express'],
    'node js': ['nodejs'],
    'node.js': ['nodejs'],
    'nodejs': ['nodejs'],
    'node': ['nodejs'],
    'next js': ['nextjs'],
    'next.js': ['nextjs'],
    'nextjs': ['nextjs'],
    'vue js': ['vuejs'],
    'vue.js': ['vuejs'],
    'vuejs': ['vuejs'],
    'vue': ['vuejs'],
    'react js': ['react'],
    'react.js': ['react'],
    'reactjs': ['react'],
    'react': ['react'],
    'react native': ['react'],
    'angular js': ['angular'],
    'angularjs': ['angular'],
    'angular': ['angular'],
    'html5': ['html5'],
    'html': ['html5'],
    'css3': ['css3'],
    'css': ['css3'],
    'javascript': ['javascript'],
    'js': ['javascript'],
    'ecmascript': ['javascript'],
    'typescript': ['typescript'],
    'ts': ['typescript'],
    'c#': ['csharp'],
    'csharp': ['csharp'],
    'c sharp': ['csharp'],
    'c++': ['cplusplus'],
    'cpp': ['cplusplus'],
    'cplusplus': ['cplusplus'],
    'c': ['c'],
    'golang': ['go'],
    'go': ['go'],
    'mongo': ['mongodb'],
    'mongodb': ['mongodb'],
    'postgres': ['postgresql'],
    'postgresql': ['postgresql'],
    'mysql': ['mysql'],
    'sql': ['sql'],
    'php': ['php'],
    'xml': ['xml'],
    'json': ['json'],
    'laravel': ['laravel'],
    'python': ['python'],
    'django': ['django'],
    'flutter': ['flutter'],
    'dart': ['dart'],
    'git': ['git'],
    'github': ['github'],
    'bootstrap': ['bootstrap'],
    'wordpress': ['wordpress'],
    'docker': ['docker'],
    'kubernetes': ['kubernetes'],
    'k8s': ['kubernetes'],
    'jquery': ['jquery'],
    'java': ['java'],
    'kotlin': ['kotlin'],
    'swift': ['swift'],
    'rust': ['rust'],
    'android': ['android'],
    'firebase': ['firebase'],
    'graphql': ['graphql'],
    'linux': ['linux'],
    'seo': ['seo'],
    'search engine optimization': ['seo'],
  };

  static final RegExp _punctuationPattern = RegExp(r'[()\[\]{}:;]');
  static final RegExp _whitespacePattern = RegExp(r'\s+');
  static final RegExp _delimiterPattern = RegExp(
    r'\s*,\s*|\s*&\s*|\s*/\s*|\s*\|\s*|\s+\+\s+|\s+(?:and|with)\s+',
    caseSensitive: false,
  );

  static String _normalizePhrase(String? raw) {
    if (raw == null) return '';
    return raw
        .toLowerCase()
        .replaceAll(_punctuationPattern, ' ')
        .replaceAll(_whitespacePattern, ' ')
        .trim();
  }

  static void _addIds(
    List<String> ids,
    List<TechLogoAsset> results,
    Set<String> seen,
  ) {
    for (final id in ids) {
      final asset = catalog[id];
      if (asset != null && seen.add(asset.id)) {
        results.add(asset);
      }
    }
  }

  static void _resolveChunk(
    String chunk,
    List<TechLogoAsset> results,
    Set<String> seen,
  ) {
    final clean = _normalizePhrase(chunk);
    if (clean.isEmpty) return;

    final direct = _compositeAliases[clean] ??
        (catalog.containsKey(clean) ? [clean] : null);
    if (direct != null) {
      _addIds(direct, results, seen);
      return;
    }

    // Fallback for space-separated tech names such as "XML JSON".
    final words = clean.split(_whitespacePattern);
    if (words.length > 1) {
      for (var i = 0; i < words.length; i++) {
        if (i + 1 < words.length) {
          final pair = '${words[i]} ${words[i + 1]}';
          final pairIds = _compositeAliases[pair];
          if (pairIds != null) {
            _addIds(pairIds, results, seen);
            i += 1;
            continue;
          }
        }
        final wordIds = _compositeAliases[words[i]] ??
            (catalog.containsKey(words[i]) ? [words[i]] : null);
        if (wordIds != null) {
          _addIds(wordIds, results, seen);
        }
      }
    }
  }

  /// Resolves any single or combined technology category name into an ordered,
  /// deduplicated list of official SVG logo assets.
  static List<TechLogoAsset> resolve(String? name) {
    final clean = _normalizePhrase(name);
    if (clean.isEmpty) return const [];

    final results = <TechLogoAsset>[];
    final seen = <String>{};

    final fullIds = _compositeAliases[clean] ??
        (catalog.containsKey(clean) ? [clean] : null);
    if (fullIds != null) {
      _addIds(fullIds, results, seen);
      return List.unmodifiable(results);
    }

    final segments = clean.split(_delimiterPattern);
    for (final segment in segments) {
      _resolveChunk(segment, results, seen);
    }

    return List.unmodifiable(results);
  }
}
