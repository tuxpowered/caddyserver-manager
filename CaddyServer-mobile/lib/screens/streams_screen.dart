import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class StreamsScreen extends StatefulWidget {
  const StreamsScreen({super.key});

  @override
  State<StreamsScreen> createState() => _StreamsScreenState();
}

class _StreamsScreenState extends State<StreamsScreen> {
  List<dynamic>? _streams;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStreams();
  }

  Future<void> _fetchStreams() async {
    setState(() => _isLoading = true);
    final streams = await context.read<ApiService>().fetchStreams();
    if (mounted) {
      setState(() {
        _streams = streams;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Layer4 Streams'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchStreams,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00F2FF)))
          : RefreshIndicator(
              onRefresh: _fetchStreams,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _streams?.length ?? 0,
                itemBuilder: (context, index) {
                  final stream = _streams![index];
                  final bool isActive = stream['status'] == 'active';
                  
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isActive ? Colors.cyanAccent.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                        child: Icon(
                          stream['protocol'] == 'udp' ? Icons.directions_boat_rounded : Icons.swap_horiz_rounded,
                          color: isActive ? Colors.cyanAccent : Colors.grey,
                        ),
                      ),
                      title: Text(stream['name'] ?? 'Unnamed Stream', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${stream['listen_port']} ➔ ${stream['upstream_host']}:${stream['upstream_port']}'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isActive ? Colors.emeraldAccent.withOpacity(0.1) : Colors.redAccent.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isActive ? 'ACTIVE' : 'INACTIVE',
                          style: TextStyle(
                            color: isActive ? Colors.emeraldAccent : Colors.redAccent,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
