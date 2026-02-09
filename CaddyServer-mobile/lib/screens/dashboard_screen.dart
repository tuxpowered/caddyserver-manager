import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'terminal_screen.dart';
import 'streams_screen.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  BannerAd? _bannerAd;
  bool _isBannerAdReady = false;
  Map<String, dynamic>? _systemStatus;
  List<dynamic>? _domains;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _initBannerAd();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isSyncing = true);
    final api = context.read<ApiService>();
    final status = await api.fetchSystemStatus();
    final domains = await api.fetchDomains();
    
    if (mounted) {
      setState(() {
        _systemStatus = status;
        _domains = domains;
        _isSyncing = false;
      });
    }
  }

  void _initBannerAd() {
    final settings = context.read<ApiService>().publicSettings;
    final adsEnabled = settings?['ads_enabled'] == '1' || settings?['ads_enabled'] == true;
    final adUnitId = settings?['ad_mob_banner_id'] ?? '';

    // If ID is empty, use the official Googletest ID for development
    final effectiveId = adUnitId.isEmpty ? 'ca-app-pub-3940256099942544/6300978111' : adUnitId;

    if (!adsEnabled) return;

    _bannerAd = BannerAd(
      adUnitId: effectiveId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) => setState(() => _isBannerAdReady = true),
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          debugPrint('Ad failed to load: $error');
        },
      ),
    );
    _bannerAd!.load();
  }

  String _formatMemory(dynamic total, dynamic free) {
    if (total == null || free == null) return 'N/A';
    final totalGb = (total as int) / 1073741824;
    final usedGb = (total - (free as int)) / 1073741824;
    return '${usedGb.toStringAsFixed(1)} GB / ${totalGb.toStringAsFixed(1)} GB';
  }

  String _formatUptime(dynamic seconds) {
    if (seconds == null) return 'N/A';
    final duration = Duration(seconds: (seconds as num).toInt());
    final days = duration.inDays;
    final hours = duration.inHours % 24;
    final minutes = duration.inMinutes % 60;
    return '${days}d ${hours}h ${minutes}m';
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();

    return Scaffold(
      appBar: AppBar(
        title: Text(api.publicSettings?['app_title'] ?? 'Caddy Fleet'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          if (_isSyncing)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00F2FF))),
            ),
          IconButton(
            icon: const Icon(Icons.power_settings_new_rounded, color: Colors.redAccent),
            onPressed: () => api.logout(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchData,
              color: const Color(0xFF00F2FF),
              backgroundColor: const Color(0xFF161B22),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(), // Ensures refresh works even if list is short
                padding: const EdgeInsets.all(20),
                children: [
                   Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          'CPU Cores', 
                          '${_systemStatus?['cpu'] ?? 'N/A'} Threads', 
                          Icons.memory_rounded, 
                          Colors.cyanAccent
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionCard(
                          'Restart Caddy', 
                          Icons.restart_alt_rounded, 
                          Colors.orangeAccent,
                          () => _confirmRestart(),
                        ),
                      ),
                    ],
                  ),
                  _buildMetricCard(
                    'Memory', 
                    _formatMemory(_systemStatus?['totalMemory'], _systemStatus?['freeMemory']), 
                    Icons.speed_rounded, 
                    Colors.purpleAccent
                  ),
                  _buildMetricCard(
                    'Uptime', 
                    _formatUptime(_systemStatus?['uptime']), 
                    Icons.timer_outlined, 
                    Colors.emeraldAccent
                  ),
                  const SizedBox(height: 12),
                  _buildNavCard('View System Logs', Icons.terminal_rounded, const Color(0xFF00FF41), () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const TerminalScreen()));
                  }),
                  const SizedBox(height: 12),
                  _buildNavCard('Layer4 Streams', Icons.layers_rounded, Colors.cyanAccent, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const StreamsScreen()));
                  }),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Managed Domains',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      Text(
                        '${_domains?.length ?? 0} Total',
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_domains == null || _domains!.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Text(
                          _domains == null ? 'Syncing...' : 'No domains found.',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._domains!.map((d) => _buildDomainTile(
                      d['host'] ?? 'Unknown', 
                      d['ssl'] == 1 || d['ssl'] == true,
                      d['id']?.toString() ?? '',
                    )),
                ],
              ),
            ),
          ),
          if (_isBannerAdReady && _bannerAd != null)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                border: const Border(top: BorderSide(color: Colors.white10)),
              ),
              alignment: Alignment.center,
              width: _bannerAd!.size.width.toDouble(),
              height: _bannerAd!.size.height.toDouble() + 16,
              child: AdWidget(ad: _bannerAd!),
            ),
        ],
      ),
    );
  }

  void _confirmRestart() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Restart Service?'),
        content: const Text('This will briefly interrupt traffic. Are you sure?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<ApiService>().restartService();
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Restart initiated...')));
            }, 
            child: const Text('Restart', style: TextStyle(color: Colors.orangeAccent))
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
      ),
    );
  }

  Widget _buildDomainTile(String domain, bool online, String id) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: ListTile(
        leading: Icon(Icons.language_rounded, color: online ? Colors.cyanAccent : Colors.grey),
        title: Text(domain, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(online ? 'SSL: ACTIVE' : 'SSL: PENDING', style: TextStyle(color: online ? Colors.emeraldAccent : Colors.amberAccent, fontSize: 10)),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'renew', child: Text('Renew SSL Certificate')),
            const PopupMenuItem(value: 'details', child: Text('View Details')),
          ],
          onSelected: (value) {
            if (value == 'renew') {
              context.read<ApiService>().renewSsl(id);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Renewal requested for $domain')));
            }
          },
        ),
      ),
    );
  }
}
