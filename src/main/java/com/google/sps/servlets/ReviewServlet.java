package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.PlaceReviews;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.*;
import java.lang.Math;
import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet that returns reviews.*/
@WebServlet("/review")
public class ReviewServlet extends HttpServlet {

  /**
  * fetch method: retrieves all reviews of a given place
  * @param request ServletRequest with field 'place_id'
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the requested place using it's ID. 
    String place_id = request.getParameter("place_id");
    // Defer to sort by recent if poor format
    String sortType = request.getParameter("sort");
    Filter placeFilter = new FilterPredicate("place_id", FilterOperator.EQUAL, place_id);
    Query query = new Query("Review").setFilter(placeFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    UserService userService = UserServiceFactory.getUserService();
    PreparedQuery results = datastore.prepare(query);

    // If no user logged in, sets to null. 
    String currUser = (userService.getCurrentUser() != null) 
        ? userService.getCurrentUser().getEmail() : null;
    PlaceReviews currentPlace = new PlaceReviews(place_id);
    double rating = 0;
    double count = 0;

    for (Entity review : results.asIterable()) {
      count++;
      long id = review.getKey().getId();
      String message = (String) review.getProperty("message");
      Date timestamp = (Date) review.getProperty("timestamp");
      String author = (String) review.getProperty("author");
      double rate = (review.getProperty("rate") == null) ? 0 : ((Long) review.getProperty("rate")).doubleValue();
      rating += rate;
      Long positive = 0L;
      Long negative = 0L;
      
      if ((String) review.getProperty("positive") != null){
        positive = Long.parseLong((String) review.getProperty("positive"));
      }
      if ((String) review.getProperty("negative") != null){
        negative = Long.parseLong((String) review.getProperty("negative"));
      }
      Comment com = new Comment(author, message, timestamp, positive, negative, rate);
      com.setId(id);
      currentPlace.addReview(com);
      // If the user is logged in, add their voting status to the comment.
      if (currUser != null){
        addVote(id, com, currUser);
      }
    }

    rating = (count == 0) ? 0 : rating/count;
    rating = Math.round(rating * 10) / 10.0;

    currentPlace.setRating(rating);
    currentPlace.sortReviews(sortType);
    currentPlace.setCurrentUser(currUser);

    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(currentPlace);
    response.getWriter().println(json);
  }

  /** 
   * Retrieves data from new-review submission form and creates relevant entity.
   * Assumes user is logged in before posting review.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    String firstName = request.getParameter("firstName");
    String lastName = request.getParameter("lastName");
    int rating = Integer.parseInt(request.getParameter("rate"));
    String reviewText = request.getParameter("comment");

    // Create new Comment instance.
    String userName = firstName.concat(" ".concat(lastName));
    Date time = new Date();
    long zero = 0; // 0 gets incorrectly cast as int if used directly.
    Comment newReview = new Comment(userName, reviewText, time, zero, zero, rating);
    
    // Query for existing reviews from place_id.
    String place_id = request.getParameter("place_id");

    // Add new review to datastore with the place_id. 
    addToDatastore(newReview, place_id, rating);

    Entity curLocation = queryLocation(place_id, datastore);
    // Check if there is currently a location already in the datastore
    if (curLocation == null){
      curLocation = new Entity("Places", place_id); 
    }
    // Update datastore
    datastore.put(curLocation);
  }
   
  // Adds each new review to the datastore. 
  public void addToDatastore(Comment comment, String place_id, int rate){
    String message = comment.getMessage();
    Date timestamp = comment.getTime();
    String author = comment.getAuthor();

    Entity reviewEntity = new Entity("Review");
    reviewEntity.setProperty("message", message);
    reviewEntity.setProperty("timestamp", timestamp);
    reviewEntity.setProperty("author", author);
    reviewEntity.setProperty("place_id", place_id);
    reviewEntity.setProperty("positive", "0"); // Cast as string for easy typing.
    reviewEntity.setProperty("negative", "0");
    reviewEntity.setProperty("rate", rate);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(reviewEntity);

    // Comment object gets it's datastore id, which only exists after it is put into the datastore. 
    comment.setId(reviewEntity.getKey().getId());
  }

  /**
   * Retrieval of PlaceReviews by id
   * @param place_id The Maps API id for a location
   * @param datastore Current DatastoreService for saving PlaceReviews
   * @return Returns zero or one Entities corresponding to the place being queried.
   */
  public Entity queryLocation(String place_id, DatastoreService datastore) {
    Filter placeFilter = new FilterPredicate("place_id", FilterOperator.EQUAL, place_id);
    Query query = new Query("PlaceReviews").setFilter(placeFilter);

    PreparedQuery results = datastore.prepare(query);

    List<Entity> places = new ArrayList<Entity>();
    for (Entity entity : results.asIterable()) {
      places.add(entity);
    }
    return trimQuery(places);
  }

  /**
   * Assert function
   * Helper function from query to ensure only one or no locations have been returned.
   * @return Returns zero or one Entities corresponding to the place being queried.
   */
  public Entity trimQuery(List<Entity> queryResults) /*throws IOException*/ {
    if (queryResults.size() > 1) {
      /***** TEMPORARY FIX TO DEBUG CODE. *****/
      /*** throw new IOException("Database Error: Multiple locations with same ID."); ***/
      return null;
    } else if(queryResults.size() == 0) {
      return null;
    }
    return queryResults.get(0);
  }

  /* addVote adds the current user's vote to the comment. 
   * @param id Long
   * @param com Comment
   * @param currentUser String
   */ 
  public void addVote(Long id, Comment com, String currentUser){
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    // Looks in the database for the review / voter combo with this review id & current user.
    Filter reviewFilter = new FilterPredicate("review_id", FilterOperator.EQUAL, id);
    Filter voterFilter = new FilterPredicate("voter", FilterOperator.EQUAL, currentUser);
    Filter combinedFilter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(reviewFilter, voterFilter));
    Query query = new Query("voter-review").setFilter(combinedFilter);

    PreparedQuery results = datastore.prepare(query);
    
    // Adds the user's current voting status to the comment
    if (results.countEntities() == 1){
        Entity entity = results.asSingleEntity();
        String vote = (String) entity.getProperty("vote");
        com.setVote(vote);
    }
  }
}

