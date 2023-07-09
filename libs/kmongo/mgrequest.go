package kmongo

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DbRequest struct {
	addr   string
	user   string
	pass   string
	client *mongo.Client
	Failed bool
}

type kgetvalues struct {
	Container string
	Values    []string
	Keys      map[string]string
}

type ksetvalues struct {
	Container string
	Values    map[string]string
	Keys      map[string]string
}

var proto = "https://"

func (self *DbRequest) OpenSession(addr string, user string, pass string) bool {
	//url := proto + addr + ":" + strconv.Itoa(int(port)) + "/dbopen"

	self.addr = addr
	self.user = user
	self.pass = pass

	url := "mongodb+srv://" + user + ":" + pass + "@" + addr + ".hr2fsad.mongodb.net/?retryWrites=true&w=majority"

	log.Print("Open database session: ", url)

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)

	opts := options.Client().ApplyURI(url).SetServerAPIOptions(serverAPI)

	var err error

	self.client, err = mongo.Connect(context.TODO(), opts)
	if err != nil {
		log.Println("MongoDB error: ", err.Error())
		return false
	}

	log.Print("Open database connection pass: pinging...")

	if err := self.client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Err(); err != nil {
		log.Println("MongoDB error: ", err.Error())
		self.client = nil
		return false
	}

	return true
}

func (self *DbRequest) CloseSession() bool {
	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return false
	}

	if err := self.client.Disconnect(context.TODO()); err != nil {
		log.Println("MongoDB error: ", err.Error())
		return false
	}

	self.client = nil
	self.user = ""
	self.pass = ""
	self.addr = ""

	return true
}

func (self *DbRequest) UpdateSession() bool {
	url := "mongodb+srv://" + self.user + ":" + self.pass + "@" + self.addr

	var err error

	if self.client != nil {
		err = self.client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Err()

		if err == nil {
			return true
		}

		log.Println("MongoDB update session error: ", err.Error())

		self.client = nil
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)

	opts := options.Client().ApplyURI(url).SetServerAPIOptions(serverAPI)

	self.client, err = mongo.Connect(context.TODO(), opts)

	if err != nil {
		log.Println("MongoDB update error: ", err.Error())
		self.client = nil
		return false
	}

	return true
}

func (self *DbRequest) ValidSession() bool {
	var err error

	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return false
	}

	if err = self.client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Err(); err != nil {
		log.Println("MongoDB validity error: ", err.Error())
		return false
	}

	return true
}

func (self *DbRequest) GetValues(doc string, vals []string, keys map[string]string) []string {
	log.Println("MongoDB find collection: ", doc)

	self.Failed = true

	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return nil
	}
	col := self.client.Database("mongo13_db").Collection(doc)

	var filter bson.D

	for k, v := range keys {
		kk := k //"\"" + k + "\""
		vv := v //"\"" + v + "\""
		filter = append(filter, bson.E{kk, vv})
	}

	//filter = bson.D{{"email", "user@mail.com"}}
	log.Println("MongoDB find filter: ", filter)
	//opts := options.Find().SetSort(bson.D{{}})
	//cur, err := col.Find(context.TODO(), filter, nil) //opts) bson.D{{"name", "Bob"}}
	cur, err := col.Find(context.TODO(), filter, nil) //opts) bson.D{{"name", "Bob"}}

	if err != nil {
		log.Println("MongoDB find error: ", err.Error())
		return nil
	}

	var res []bson.M

	if err = cur.All(context.TODO(), &res); err != nil {
		log.Println("MongoDB cursor error: ", err.Error())
		return nil
	}

	var ret []string

	log.Println("MongoDB cursor result: ", res)

	for _, r := range res {
		for n := range vals {
			d := fmt.Sprintf("%v", r[vals[n]])

			ret = append(ret, d)
		}
	}

	log.Println("GetValues result: ", ret)
	self.Failed = false

	return ret
}

func (self *DbRequest) SetValues(doc string, vals map[string]string, keys map[string]string) bool {
	log.Println("MongoDB insert collection: ", doc)

	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return false
	}

	col := self.client.Database("mongo13_db").Collection(doc)

	var filter bson.D

	var replace bson.D

	for k, v := range vals {
		kk := k //"\"" + k + "\""
		vv := v //"\"" + v + "\""
		filter = append(filter, bson.E{kk, vv})
	}

	//filter = bson.D{{"email", "user@mail.com"}}
	log.Println("MongoDB insert filter: ", filter)
	//opts := options.Find().SetSort(bson.D{{}})
	//cur, err := col.Find(context.TODO(), filter, nil) //opts) bson.D{{"name", "Bob"}}
	if keys != nil && len(keys) > 0 {
		for k, v := range keys {
			replace = append(filter, bson.E{k, v})
		}

		res, err := col.ReplaceOne(context.TODO(), replace, filter, nil)

		if err != nil {
			log.Println("MongoDB replace error: ", err.Error())
			return false
		}

		log.Println("MongoDB repace id: ", res.MatchedCount)
	} else {
		res, err := col.InsertOne(context.TODO(), filter, nil)
		if err != nil {
			log.Println("MongoDB insert error: ", err.Error())
			return false
		}

		log.Println("MongoDB insert id: ", res.InsertedID)
	}

	return true
}

func (self *DbRequest) DelValues(doc string, vals []string, keys map[string]string) bool {
	log.Println("MongoDB delete collection: ", doc)

	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return false
	}

	col := self.client.Database("mongo13_db").Collection(doc)

	var err error

	var filter bson.D

	for k, v := range keys {
		filter = append(filter, bson.E{k, v})
	}

	log.Println("MongoDB delete filter: ", filter)

	res, err := col.DeleteOne(context.TODO(), filter, nil)

	if err != nil {
		log.Println("MongoDB delete error: ", err.Error())
		return false
	}

	log.Println("MongoDB delete count: ", res.DeletedCount)

	return true
}

func (self *DbRequest) HasValues(doc string, vals []string, keys map[string]string) bool {
	log.Println("MongoDB check find collection: ", doc)

	if self.client == nil {
		log.Println("MongoDB client invalid.")
		return false
	}

	col := self.client.Database("mongo13_db").Collection(doc)

	var filter bson.D

	for k, v := range keys {
		filter = append(filter, bson.E{k, v})
	}

	log.Println("MongoDB check find filter: ", filter)

	var dres map[string]string

	err := col.FindOne(context.TODO(), filter, nil).Decode(&dres)

	if err != nil {
		log.Println("MongoDB check find error: ", err.Error())
		return false
	}

	for _, v := range vals {
		_, ok := dres[v]

		if !ok {
			log.Println("MongoDB check find error: Absent value")
			return false
		}
	}

	return true
}
