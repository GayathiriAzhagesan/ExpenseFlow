package repositories

import (
	"context"
	"log"
	"strings"
	"time"

	"expenseflow-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoRepository struct {
	client        *mongo.Client
	db            *mongo.Database
	users         *mongo.Collection
	expenses      *mongo.Collection
	groups        *mongo.Collection
	settlements   *mongo.Collection
	notifications *mongo.Collection
}

func NewMongoRepository(uri, dbName string) (*MongoRepository, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	repo := &MongoRepository{
		client:        client,
		db:            db,
		users:         db.Collection("users"),
		expenses:      db.Collection("expenses"),
		groups:        db.Collection("groups"),
		settlements:   db.Collection("settlements"),
		notifications: db.Collection("notifications"),
	}

	repo.ensureIndexes()
	repo.SeedIfEmpty()
	log.Printf("[MongoDB] Successfully connected to %s", dbName)
	return repo, nil
}

func (r *MongoRepository) ensureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Users email unique index
	_, _ = r.users.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	})

	// Expenses date & groupId index
	_, _ = r.expenses.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "groupId", Value: 1}, {Key: "createdAt", Value: -1}},
	})

	// Notifications userId index
	_, _ = r.notifications.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "userId", Value: 1}, {Key: "read", Value: 1}},
	})
}

// User Methods
func (r *MongoRepository) FindUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	filter := bson.M{"email": strings.ToLower(strings.TrimSpace(email))}
	err := r.users.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *MongoRepository) FindUserByID(id string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	err = r.users.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *MongoRepository) CreateUser(user *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.users.InsertOne(ctx, user)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		user.ID = oid.Hex()
	}
	return nil
}

func (r *MongoRepository) UpdateUser(user *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(user.ID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": user.ID}}}
	} else {
		filter = bson.M{"id": user.ID}
	}

	update := bson.M{"$set": bson.M{
		"name":      user.Name,
		"avatar":    user.Avatar,
		"phone":     user.Phone,
		"updatedAt": time.Now(),
	}}
	_, err = r.users.UpdateOne(ctx, filter, update)
	return err
}

// Expense Methods
func (r *MongoRepository) GetAllExpenses(userID, category, splitType, search string) ([]models.Expense, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if category != "" && category != "all" {
		filter["category"] = category
	}
	if splitType != "" && splitType != "all" {
		filter["splitType"] = splitType
	}
	if search != "" {
		filter["$or"] = []bson.M{
			{"description": bson.M{"$regex": search, "$options": "i"}},
			{"paidBy.name": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := r.expenses.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Expense
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *MongoRepository) GetExpenseByID(id string) (*models.Expense, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	var exp models.Expense
	err = r.expenses.FindOne(ctx, filter).Decode(&exp)
	if err != nil {
		return nil, err
	}
	return &exp, nil
}

func (r *MongoRepository) CreateExpense(exp *models.Expense) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.expenses.InsertOne(ctx, exp)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		exp.ID = oid.Hex()
	}
	return nil
}

func (r *MongoRepository) UpdateExpense(exp *models.Expense) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(exp.ID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": exp.ID}}}
	} else {
		filter = bson.M{"id": exp.ID}
	}

	update := bson.M{"$set": exp}
	_, err = r.expenses.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoRepository) DeleteExpense(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = r.expenses.DeleteOne(ctx, filter)
	return err
}

// Group Methods
func (r *MongoRepository) GetAllGroups(userID string) ([]models.Group, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.groups.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "updatedAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Group
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *MongoRepository) GetGroupByID(id string) (*models.Group, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	var grp models.Group
	err = r.groups.FindOne(ctx, filter).Decode(&grp)
	if err != nil {
		return nil, err
	}
	return &grp, nil
}

func (r *MongoRepository) CreateGroup(group *models.Group) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.groups.InsertOne(ctx, group)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		group.ID = oid.Hex()
	}
	return nil
}

func (r *MongoRepository) UpdateGroup(group *models.Group) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(group.ID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": group.ID}}}
	} else {
		filter = bson.M{"id": group.ID}
	}

	update := bson.M{"$set": group}
	_, err = r.groups.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoRepository) DeleteGroup(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = r.groups.DeleteOne(ctx, filter)
	return err
}

func (r *MongoRepository) AddMemberToGroup(groupID string, member models.GroupMember) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(groupID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": groupID}}}
	} else {
		filter = bson.M{"id": groupID}
	}

	update := bson.M{
		"$push": bson.M{"members": member},
		"$set":  bson.M{"updatedAt": time.Now()},
	}
	_, err = r.groups.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoRepository) RemoveMemberFromGroup(groupID, memberID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(groupID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": groupID}}}
	} else {
		filter = bson.M{"id": groupID}
	}

	update := bson.M{
		"$pull": bson.M{"members": bson.M{"id": memberID}},
		"$set":  bson.M{"updatedAt": time.Now()},
	}
	_, err = r.groups.UpdateOne(ctx, filter, update)
	return err
}

// Settlement Methods
func (r *MongoRepository) GetAllSettlements(userID, groupID string) ([]models.Settlement, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if groupID != "" {
		filter["groupId"] = groupID
	}

	cursor, err := r.settlements.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Settlement
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *MongoRepository) GetSettlementByID(id string) (*models.Settlement, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	var st models.Settlement
	err = r.settlements.FindOne(ctx, filter).Decode(&st)
	if err != nil {
		return nil, err
	}
	return &st, nil
}

func (r *MongoRepository) CreateSettlement(settlement *models.Settlement) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.settlements.InsertOne(ctx, settlement)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		settlement.ID = oid.Hex()
	}
	return nil
}

func (r *MongoRepository) UpdateSettlement(settlement *models.Settlement) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(settlement.ID)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": settlement.ID}}}
	} else {
		filter = bson.M{"id": settlement.ID}
	}

	update := bson.M{"$set": settlement}
	_, err = r.settlements.UpdateOne(ctx, filter, update)
	return err
}

// Notification Methods
func (r *MongoRepository) GetAllNotifications(userID string) ([]models.Notification, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if userID != "" {
		filter["userId"] = userID
	}

	cursor, err := r.notifications.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []models.Notification
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *MongoRepository) MarkNotificationAsRead(id, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"$or": []bson.M{{"_id": objID}, {"id": id}}}
	} else {
		filter = bson.M{"id": id}
	}

	update := bson.M{"$set": bson.M{"read": true}}
	_, err = r.notifications.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoRepository) MarkAllNotificationsAsRead(userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if userID != "" {
		filter["userId"] = userID
	}
	update := bson.M{"$set": bson.M{"read": true}}
	_, err := r.notifications.UpdateMany(ctx, filter, update)
	return err
}

func (r *MongoRepository) CreateNotification(notif *models.Notification) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.notifications.InsertOne(ctx, notif)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		notif.ID = oid.Hex()
	}
	return nil
}

func (r *MongoRepository) SeedIfEmpty() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := r.expenses.CountDocuments(ctx, bson.M{})
	if err == nil && count > 0 {
		return
	}

	log.Println("[MongoDB] Seeding initial users, groups, and expenses into database...")
	mem := NewMemoryRepository()

	// Seed Users
	for _, u := range mem.users {
		_, _ = r.users.InsertOne(ctx, u)
	}
	// Seed Groups
	for _, g := range mem.groups {
		_, _ = r.groups.InsertOne(ctx, g)
	}
	// Seed Expenses
	for _, e := range mem.expenses {
		_, _ = r.expenses.InsertOne(ctx, e)
	}
	// Seed Settlements
	for _, s := range mem.settlements {
		_, _ = r.settlements.InsertOne(ctx, s)
	}
	// Seed Notifications
	for _, n := range mem.notifications {
		_, _ = r.notifications.InsertOne(ctx, n)
	}
	log.Println("[MongoDB] Seeding complete!")
}

