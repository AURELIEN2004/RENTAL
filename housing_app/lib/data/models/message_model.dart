// // lib/data/models/message_model.dart
//
// CORRECTIONS :
//  ✅ ConversationModel.otherUser()     → alias de otherParticipant() (attendu par conversations_screen)
//  ✅ LastMessageModel.isImageMessage   → getter booléen attendu par conversations_screen

class ConversationModel {
  final int id;
  final int? housingId;
  final String? housingTitle;
  final String? housingImage;
  final int? housingPrice;
  final List<ParticipantModel> participants;
  final LastMessageModel? lastMessage;
  final int unreadCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ConversationModel({
    required this.id,
    this.housingId,
    this.housingTitle,
    this.housingImage,
    this.housingPrice,
    required this.participants,
    this.lastMessage,
    this.unreadCount = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    final housing = json['housing'];
    int? hId;
    String? hTitle;
    String? hImage;
    int? hPrice;
    if (housing is Map) {
      hId    = (housing['id'] as num?)?.toInt();
      hTitle = housing['title'] as String?
            ?? housing['display_name'] as String?;
      hImage = housing['main_image'] as String?;
      hPrice = (housing['price'] as num?)?.toInt();
    }

    return ConversationModel(
      id:           (json['id'] as num).toInt(),
      housingId:    hId,
      housingTitle: hTitle,
      housingImage: hImage,
      housingPrice: hPrice,
      participants: (json['participants'] as List? ?? [])
          .map((p) => ParticipantModel.fromJson(
              p as Map<String, dynamic>))
          .toList(),
      lastMessage: json['last_message'] != null
          ? LastMessageModel.fromJson(
              json['last_message'] as Map<String, dynamic>)
          : null,
      unreadCount: (json['unread_count'] as num?)?.toInt() ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
              ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : null,
    );
  }

  // ✅ otherParticipant — nom principal
  ParticipantModel? otherParticipant(int currentUserId) {
    final others =
        participants.where((p) => p.id != currentUserId);
    return others.isNotEmpty ? others.first : null;
  }

  // ✅ otherUser — alias attendu par conversations_screen.dart
  ParticipantModel? otherUser(int currentUserId) =>
      otherParticipant(currentUserId);

  String otherUserName(int currentUserId) =>
      otherParticipant(currentUserId)?.username ?? 'Inconnu';
}

// ── Participant ──────────────────────────────────────────────
class ParticipantModel {
  final int    id;
  final String username;
  final String? photo;
  final String? phone;
  final bool   isProprietaire;
  final bool   isLocataire;

  const ParticipantModel({
    required this.id,
    required this.username,
    this.photo,
    this.phone,
    this.isProprietaire = false,
    this.isLocataire    = false,
  });

  factory ParticipantModel.fromJson(Map<String, dynamic> json) =>
      ParticipantModel(
        id:             (json['id'] as num).toInt(),
        username:       json['username'] as String? ?? '',
        photo:          json['photo']    as String?,
        phone:          json['phone']    as String?,
        isProprietaire: json['is_proprietaire'] as bool? ?? false,
        isLocataire:    json['is_locataire']    as bool? ?? false,
      );

  String get initials => username.isNotEmpty
      ? username[0].toUpperCase()
      : 'U';
}

// ── LastMessageModel ─────────────────────────────────────────
class LastMessageModel {
  final int      id;
  final int      senderId;
  final String?  content;
  final String?  image;
  final String?  video;
  final bool     isRead;
  final DateTime createdAt;

  const LastMessageModel({
    required this.id,
    required this.senderId,
    this.content,
    this.image,
    this.video,
    required this.isRead,
    required this.createdAt,
  });

  factory LastMessageModel.fromJson(Map<String, dynamic> json) =>
      LastMessageModel(
        id:       (json['id'] as num).toInt(),
        senderId: (json['sender'] as num?)?.toInt() ?? 0,
        content:  json['content'] as String?,
        image:    json['image']   as String?,
        video:    json['video']   as String?,
        isRead:   json['is_read'] as bool? ?? false,
        createdAt: json['created_at'] != null
            ? DateTime.tryParse(json['created_at'].toString())
                ?? DateTime.now()
            : DateTime.now(),
      );

  // ✅ isImageMessage — getter attendu par conversations_screen.dart
  bool get isImageMessage =>
      image != null && image!.isNotEmpty;

  bool get isVideoMessage =>
      video != null && video!.isNotEmpty;

  bool get hasContent =>
      (content != null && content!.isNotEmpty) ||
      isImageMessage ||
      isVideoMessage;
}

// ── MessageModel ─────────────────────────────────────────────
class MessageModel {
  final int      id;
  final int      conversationId;
  final int      senderId;
  final String?  senderName;
  final String?  senderPhoto;
  final String?  content;
  final String?  image;
  final String?  video;
  final bool     isRead;
  final DateTime createdAt;

  const MessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.senderName,
    this.senderPhoto,
    this.content,
    this.image,
    this.video,
    this.isRead = false,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    int     sId   = 0;
    String? sName;
    String? sPhoto;

    final senderRaw = json['sender'];
    if (senderRaw is int) {
      sId   = senderRaw;
      sName = json['sender_name'] as String?;
      sPhoto = json['sender_photo'] as String?;
    } else if (senderRaw is Map) {
      sId   = (senderRaw['id'] as num?)?.toInt() ?? 0;
      sName = senderRaw['username'] as String?;
      sPhoto = senderRaw['photo']   as String?;
    }

    return MessageModel(
      id:             (json['id'] as num).toInt(),
      conversationId: (json['conversation'] as num?)?.toInt() ?? 0,
      senderId:       sId,
      senderName:     sName,
      senderPhoto:    sPhoto,
      content:        json['content'] as String?,
      image:          json['image']   as String?,
      video:          json['video']   as String?,
      isRead:         json['is_read'] as bool? ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
              ?? DateTime.now()
          : DateTime.now(),
    );
  }

  bool get isImageMsg  => image   != null && image!.isNotEmpty;
  bool get isVideoMsg  => video   != null && video!.isNotEmpty;
  bool get hasContent  =>
      (content != null && content!.isNotEmpty) ||
      isImageMsg || isVideoMsg;
}