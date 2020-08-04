// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import java.io.IOException;
import com.google.gson.Gson;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

/** Servlet that returns user-generated comments.*/
@WebServlet("/places")
public class PlacesServlet extends HttpServlet {
  private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /** Parameters: 
      @request - HttpServletRequest with parameter 'place_ID'. 
      @response - HttpServletResponse to be reset.
      Desc: This function retrieves all reviews with matching place_ID. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String place_ID = request.getParameter("place_ID");

    // Consider all data involved as preliminary
    Filter placeFilter = new FilterPredicate("place_ID", FilterOperator.EQUAL, place_ID);
    Query query = new Query("Review").setFilter(placeFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    JSONArray reviewArray = new JSONArray();
JSONObject item = new JSONObject();
item.put("information", "test");
item.put("id", 3);
item.put("name", "course1");
array.add(item);
    List<String> reviews = new ArrayList<>();
    // Adds each review entity to a list
    for (Entity entity : results.asIterable()) {
      JSONObject review = new JSONObject();
      review.put("message", (String) entity.getProperty("message"));
      review.put("timestamp", (Date) entity.getProperty("date"));
      review.put("total", (int) entity.getProperty("total"));
      reviews.add(message + "-" + timestamp.toString() + " ; " + total);
    }

    // Set response and return JSON.
    response.setContentType("text/json;");
    String json = convertToJsonUsingGson(strResponse);
    response.getWriter().println(json);
  }

  /** Parameters: 
      @request - HttpServletRequest with paremeter 'place_ID'. 
      @response - HttpServletResponse to be reset.
      Desc: This function creates a new placeEntity using a place_ID. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    // Retrieve comment, comment quantity, and current user.
    String place_ID = request.getParameter("place_ID");


    // Create entity for datastore.
    Entity placeEntity = new Entity("place");
    placeEntity.setProperty("id", place_ID);
    placeEntity.setProperty("totalVotes", 0);
    placeEntity.setProperty("avgRating", 0);

    datastore.put(placeEntity);
    response.setContentType("text/html");
    response.sendRedirect("/index.html"); //Perhaps a different redirect may make more sense here.
  }

  /** Converts ArrayList of Strings to JSON using GSON. */
  private String convertToJsonUsingGson(ArrayList<String> comments) {
    Gson gson = new Gson();
    String json = gson.toJson(comments);
    return json;
  }
}