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
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.PlaceReviews;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.*;
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
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    Entity curLocation = queryLocation(place_id, datastore);
    List<Comment> curReviews = new ArrayList<Comment>();

    // Make sure a place returns. 
    if(curLocation != null) {
      PlaceReviews curPlace = (PlaceReviews) curLocation.getProperty("placeData");
      // Add all the reviews to the Json list. 
      curReviews.addAll(curPlace.getReviews());
    }
    System.out.println(curReviews);

    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(curReviews);
    response.getWriter().println(json);
  }

  /** 
   * Retrieves data from new-review submission form and creates relevant entity.
   * Assumes user is logged in before posting review.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    // Currently unused.
    String firstName = request.getParameter("firstName");
    String lastName = request.getParameter("lastName");

    Double rating = Double.parseDouble(request.getParameter("rate"));

    // Create new Comment instance.
    String userEmail = userService.getCurrentUser().getEmail(); // Used to restrict user to one review/location
    String reviewText = request.getParameter("comment");
    Date time = new Date();
    Comment newReview = new Comment(userEmail, reviewText, time, 0);
    
    // Query for existing reviews from place_id.
    String place_id = request.getParameter("place_id");

    // Add new review to datastore with the place_id. 
    addToDatastore(newReview, place_id);

    Entity curLocation = queryLocation(place_id, datastore);

    // Check if there is currently a location already in the datastore
    if (curLocation == null){
      curLocation = new Entity("Places", place_id); 
    }
    // Update datastore
    datastore.put(curLocation);

    /* Currently redirects back
     * We should modify this so that the screen doesn't completely refresh as then they would
     * have to go back and search the place again to see their review. 
     */
    response.sendRedirect("/index.html");
  }
   
  // Adds each new review to the datastore. 
  public void addToDatastore(Comment comment, String place_id){
    String message = comment.getMessage();
    Date timestamp = comment.getTime();
    String author = comment.getAuthor();

    Entity reviewEntity = new Entity("Review");
    reviewEntity.setProperty("message", message);
    reviewEntity.setProperty("timestamp", timestamp);
    reviewEntity.setProperty("author", author);
    reviewEntity.setProperty("place_id", place_id);

    // Comment object gets it's datastore id. 
    comment.setId(reviewEntity.getKey().getId());

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(reviewEntity);
  }

  
  /**
    * Takes an entity and either appends a review or creates a new PlaceReviews instance
    * and appends it to the "placeData" property.
    * @param curLocation is an entity to be set and then returned to the datastore.
    * @param newReview is the Comment instance to be appended.
    * @param rating is the current location's rating.
    * @return curLocation is the final set entity to be added to the datastore.
    */
  public Entity setCurLocation(Entity curLocation, Comment newReview, Double rating, String place_id) {
    PlaceReviews curReviews;
    if (curLocation == null) { // There has not been a review before
      curLocation = new Entity("Places");
      curReviews = new PlaceReviews(place_id, newReview, rating);
    } else { // Add review
      curReviews = (PlaceReviews) curLocation.getProperty("placeData");
      curReviews.addReview(newReview); // Handles duplicate
      curReviews.addRating(rating);
    }
    return curLocation;
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
}

