// ============================================
// lib/screens/dashbord/proprietaire_dashboard.dart
// ============================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../widgets/housing/housing_card.dart';
import '../../widgets/common/loading_widget.dart';

class ProprietaireDashboard extends StatefulWidget {
  const ProprietaireDashboard({Key? key}) : super(key: key);

  @override
  State<ProprietaireDashboard> createState() => _ProprietaireDashboardState();
}

class _ProprietaireDashboardState extends State<ProprietaireDashboard> {
  int _selectedIndex = 0;
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await context.read<HousingProvider>().fetchMyHousings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Espace Propriétaire'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications');
            },
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: _buildBody(),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.pushNamed(context, '/add-housing');
              },
              icon: const Icon(Icons.add),
              label: const Text('Ajouter'),
            )
          : null,
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
                accountName: Text(user?.username ?? 'Propriétaire'),
                accountEmail: Text(user?.email ?? ''),
                currentAccountPicture: CircleAvatar(
                  backgroundColor: Colors.white,
                  backgroundImage: user?.photo != null
                      ? NetworkImage(user!.photo!)
                      : null,
                  child: user?.photo == null
                      ? const Icon(Icons.business, size: 40)
                      : null,
                ),
              ),
              ListTile(
                leading: const Icon(Icons.dashboard_outlined),
                title: const Text('Vue d\'ensemble'),
                selected: _selectedIndex == 0,
                onTap: () {
                  setState(() => _selectedIndex = 0);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.home_outlined),
                title: const Text('Mes Logements'),
                selected: _selectedIndex == 1,
                onTap: () {
                  setState(() => _selectedIndex = 1);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.event_outlined),
                title: const Text('Réservations'),
                selected: _selectedIndex == 2,
                onTap: () {
                  setState(() => _selectedIndex = 2);
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.message_outlined),
                title: const Text('Messages'),
                onTap: () {
                  Navigator.pushNamed(context, '/conversations');
                },
              ),
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: const Text('Mon Profil'),
                onTap: () {
                  Navigator.pushNamed(context, '/profile');
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings_outlined),
                title: const Text('Paramètres'),
                onTap: () {
                  Navigator.pushNamed(context, '/settings');
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
                onTap: () async {
                  final confirm = await _showLogoutDialog();
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
        return _buildOverviewSection();
      case 1:
        return _buildMyHousingsSection();
      case 2:
        return _buildReservationsSection();
      default:
        return _buildOverviewSection();
    }
  }

  Widget _buildOverviewSection() {
    return Consumer<HousingProvider>(
      builder: (context, provider, child) {
        final housings = provider.myHousings;
        final total = housings.length;
        final disponible = housings.where((h) => h.status == 'disponible').length;
        final reserve = housings.where((h) => h.status == 'reserve').length;
        final occupe = housings.where((h) => h.status == 'occupe').length;

        return RefreshIndicator(
          onRefresh: _loadData,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Statistiques',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Statistiques en grille
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatCard('Total', total, Colors.blue, Icons.home),
                    _buildStatCard('Disponibles', disponible, Colors.green, Icons.check_circle),
                    _buildStatCard('Réservés', reserve, Colors.orange, Icons.event),
                    _buildStatCard('Occupés', occupe, Colors.red, Icons.lock),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Actions rapides
                Text(
                  'Actions Rapides',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                
                _buildActionButton(
                  'Ajouter un logement',
                  Icons.add_home,
                  Colors.green,
                  () => Navigator.pushNamed(context, '/add-housing'),
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  'Voir mes logements',
                  Icons.list,
                  Colors.blue,
                  () => setState(() => _selectedIndex = 1),
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  'Messages',
                  Icons.message,
                  Colors.purple,
                  () => Navigator.pushNamed(context, '/conversations'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, int value, Color color, IconData icon) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value.toString(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(label),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  Widget _buildMyHousingsSection() {
    return Consumer<HousingProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const LoadingWidget(message: 'Chargement...');
        }

        var housings = provider.myHousings;
        
        // Filtrer par statut
        if (_statusFilter != 'all') {
          housings = housings.where((h) => h.status == _statusFilter).toList();
        }

        return Column(
          children: [
            // Filtres
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _statusFilter,
                      decoration: const InputDecoration(
                        labelText: 'Filtrer par statut',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('Tous')),
                        DropdownMenuItem(value: 'disponible', child: Text('Disponibles')),
                        DropdownMenuItem(value: 'reserve', child: Text('Réservés')),
                        DropdownMenuItem(value: 'occupe', child: Text('Occupés')),
                      ],
                      onChanged: (value) {
                        setState(() => _statusFilter = value!);
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: _loadData,
                  ),
                ],
              ),
            ),
            
            // Liste
            Expanded(
              child: housings.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadData,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: housings.length,
                        itemBuilder: (context, index) {
                          return _buildHousingItem(housings[index]);
                        },
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildHousingItem(housing) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          HousingCard(housing: housing),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: housing.status,
                    decoration: const InputDecoration(
                      labelText: 'Statut',
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'disponible', child: Text('Disponible')),
                      DropdownMenuItem(value: 'reserve', child: Text('Réservé')),
                      DropdownMenuItem(value: 'occupe', child: Text('Occupé')),
                    ],
                    onChanged: (value) async {
                      if (value != null) {
                        final success = await context
                            .read<HousingProvider>()
                            .updateHousingStatus(housing.id, value);
                        if (success && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Statut mis à jour')),
                          );
                        }
                      }
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.blue),
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      '/edit-housing',
                      arguments: housing.id,
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.bar_chart, color: Colors.purple),
                  onPressed: () {
                    _showStatsDialog(housing);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _deleteHousing(housing.id),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.home_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Aucun logement',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Commencez par ajouter votre premier logement',
            style: TextStyle(color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(context, '/add-housing');
            },
            icon: const Icon(Icons.add),
            label: const Text('Ajouter un logement'),
          ),
        ],
      ),
    );
  }

  Widget _buildReservationsSection() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Réservations',
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

  Future<void> _deleteHousing(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le logement'),
        content: const Text(
          'Êtes-vous sûr de vouloir supprimer ce logement? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await context.read<HousingProvider>().deleteHousing(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Logement supprimé' : 'Erreur lors de la suppression'),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    }
  }

  void _showStatsDialog(housing) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Statistiques'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vues: ${housing.viewsCount}'),
            const SizedBox(height: 8),
            Text('Likes: ${housing.likesCount}'),
            const SizedBox(height: 8),
            Text('Publié le: ${housing.createdAt.day}/${housing.createdAt.month}/${housing.createdAt.year}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }

  Future<bool?> _showLogoutDialog() {
    return showDialog<bool>(
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
  }
}

