// ============================================
// lib/screens/dashbord/locataire_dashboard.dart
// ============================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../widgets/housing/housing_card.dart';
import '../../widgets/common/loading_widget.dart';

class LocataireDashboard extends StatefulWidget {
  const LocataireDashboard({Key? key}) : super(key: key);

  @override
  State<LocataireDashboard> createState() => _LocataireDashboardState();
}

class _LocataireDashboardState extends State<LocataireDashboard> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final housingProvider = context.read<HousingProvider>();
    await Future.wait([
      housingProvider.fetchFavorites(),
      housingProvider.fetchSavedHousings(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Espace'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications');
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              Navigator.pushNamed(context, '/settings');
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: _buildBody(),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;
          
          return ListView(
            padding: EdgeInsets.zero,
            children: [
              UserAccountsDrawerHeader(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).primaryColor,
                      Theme.of(context).primaryColor.withOpacity(0.7),
                    ],
                  ),
                ),
                accountName: Text(user?.username ?? 'Utilisateur'),
                accountEmail: Text(user?.email ?? ''),
                currentAccountPicture: CircleAvatar(
                  backgroundColor: Colors.white,
                  backgroundImage: user?.photo != null
                      ? NetworkImage(user!.photo!)
                      : null,
                  child: user?.photo == null
                      ? const Icon(Icons.person, size: 40)
                      : null,
                ),
              ),
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: const Text('Mon Profil'),
                selected: _selectedIndex == 0,
                onTap: () {
                  setState(() => _selectedIndex = 0);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.favorite_outline),
                title: const Text('Favoris'),
                selected: _selectedIndex == 1,
                onTap: () {
                  setState(() => _selectedIndex = 1);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.bookmark_outline),
                title: const Text('Enregistrés'),
                selected: _selectedIndex == 2,
                onTap: () {
                  setState(() => _selectedIndex = 2);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.event_outlined),
                title: const Text('Visites Planifiées'),
                selected: _selectedIndex == 3,
                onTap: () {
                  setState(() => _selectedIndex = 3);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.message_outlined),
                title: const Text('Messages'),
                selected: _selectedIndex == 4,
                onTap: () {
                  Navigator.pushNamed(context, '/conversations');
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
                onTap: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Déconnexion'),
                      content: const Text('Voulez-vous vraiment vous déconnecter?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Annuler'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Déconnexion'),
                        ),
                      ],
                    ),
                  );
                  
                  if (confirm == true && mounted) {
                    await context.read<AuthProvider>().logout();
                    if (mounted) {
                      Navigator.pushReplacementNamed(context, '/login');
                    }
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildProfileSection();
      case 1:
        return _buildFavoritesSection();
      case 2:
        return _buildSavedSection();
      case 3:
        return _buildVisitsSection();
      default:
        return _buildProfileSection();
    }
  }

  Widget _buildProfileSection() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                        backgroundImage: user?.photo != null
                            ? NetworkImage(user!.photo!)
                            : null,
                        child: user?.photo == null
                            ? Icon(Icons.person, size: 50, 
                                color: Theme.of(context).primaryColor)
                            : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user?.username ?? 'Utilisateur',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        user?.email ?? '',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.phone ?? '',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pushNamed(context, '/edit-profile');
                        },
                        icon: const Icon(Icons.edit),
                        label: const Text('Modifier le profil'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              _buildStatCard(
                'Favoris',
                Icons.favorite,
                Colors.red,
                context.watch<HousingProvider>().favorites.length.toString(),
              ),
              const SizedBox(height: 12),
              _buildStatCard(
                'Enregistrés',
                Icons.bookmark,
                Colors.blue,
                context.watch<HousingProvider>().savedHousings.length.toString(),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String title, IconData icon, Color color, String count) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(title),
        trailing: Text(
          count,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ),
    );
  }

  Widget _buildFavoritesSection() {
    return Consumer<HousingProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const LoadingWidget(message: 'Chargement des favoris...');
        }

        final favorites = provider.favorites;

        if (favorites.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.favorite_border,
                  size: 80,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Aucun favori',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Likez des logements pour les retrouver ici',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/search');
                  },
                  child: const Text('Rechercher des logements'),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: provider.fetchFavorites,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: favorites.length,
            itemBuilder: (context, index) {
              return HousingCard(housing: favorites[index]);
            },
          ),
        );
      },
    );
  }

  Widget _buildSavedSection() {
    return Consumer<HousingProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const LoadingWidget(message: 'Chargement...');
        }

        final saved = provider.savedHousings;

        if (saved.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.bookmark_border,
                  size: 80,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Aucun logement enregistré',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Enregistrez des logements pour les retrouver ici',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: provider.fetchSavedHousings,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: saved.length,
            itemBuilder: (context, index) {
              return HousingCard(housing: saved[index]);
            },
          ),
        );
      },
    );
  }

  Widget _buildVisitsSection() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.event_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Visites Planifiées',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Fonctionnalité en développement',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
